import type { VercelRequest, VercelResponse } from '@vercel/node';

const OWNER = process.env.GITHUB_OWNER!;
const REPO = process.env.GITHUB_REPO!;
const TOKEN = process.env.GITHUB_TOKEN!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;
const BASE_BRANCH = process.env.GITHUB_BASE_BRANCH || 'master';

async function gh(path: string, method: string, body?: object) {
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${method} ${path} → ${res.status}: ${text}`);
  }
  return res.status === 204 ? null : res.json();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!TOKEN || !OWNER || !REPO || !ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'Server not configured — missing environment variables' });
  }

  const { clients, newImages, deletedImages, password } = req.body as {
    clients: object[];
    newImages: { repoPath: string; base64: string }[];
    deletedImages: string[];
    password: string;
  };

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized — incorrect password' });
  }

  try {
    // 1. Get current branch commit SHA and tree SHA
    const ref = await gh(`/repos/${OWNER}/${REPO}/git/ref/heads/${BASE_BRANCH}`, 'GET') as { object: { sha: string } };
    const commitSha = ref.object.sha;
    const commit = await gh(`/repos/${OWNER}/${REPO}/git/commits/${commitSha}`, 'GET') as { tree: { sha: string } };
    const treeSha = commit.tree.sha;

    // 2. Create blobs for all new content in parallel (no per-file SHA needed)
    const [clientsBlob, ...imageBlobs] = await Promise.all([
      gh(`/repos/${OWNER}/${REPO}/git/blobs`, 'POST', {
        content: JSON.stringify(clients, null, 2),
        encoding: 'utf-8',
      }),
      ...newImages.map(img => {
        const content = img.base64.includes(',') ? img.base64.split(',')[1] : img.base64;
        return gh(`/repos/${OWNER}/${REPO}/git/blobs`, 'POST', { content, encoding: 'base64' });
      }),
    ]) as { sha: string }[];

    // 3. Build tree entries
    const tree: { path: string; mode: string; type: string; sha: string | null }[] = [
      { path: 'public/clients.json', mode: '100644', type: 'blob', sha: clientsBlob.sha },
      ...newImages.map((img, i) => ({
        path: `public/${img.repoPath}`,
        mode: '100644',
        type: 'blob',
        sha: imageBlobs[i].sha,
      })),
      // Deletions: sha null removes the file from the tree
      ...(deletedImages ?? []).map(imgPath => ({
        path: `public${imgPath}`,
        mode: '100644',
        type: 'blob',
        sha: null,
      })),
    ];

    // 4. Create new tree, commit, and update branch ref
    const newTree = await gh(`/repos/${OWNER}/${REPO}/git/trees`, 'POST', { base_tree: treeSha, tree }) as { sha: string };
    const newCommit = await gh(`/repos/${OWNER}/${REPO}/git/commits`, 'POST', {
      message: 'Update client gallery',
      tree: newTree.sha,
      parents: [commitSha],
    }) as { sha: string };
    await gh(`/repos/${OWNER}/${REPO}/git/refs/heads/${BASE_BRANCH}`, 'PATCH', { sha: newCommit.sha });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
}
