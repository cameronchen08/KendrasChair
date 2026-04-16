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

async function getFileSha(path: string, branch: string): Promise<string | undefined> {
  try {
    const data = await gh(`/repos/${OWNER}/${REPO}/contents/${path}?ref=${branch}`, 'GET');
    return (data as { sha: string }).sha;
  } catch {
    return undefined;
  }
}

async function putFile(repoPath: string, base64Content: string, message: string, branch: string) {
  const sha = await getFileSha(repoPath, branch);
  await gh(`/repos/${OWNER}/${REPO}/contents/${repoPath}`, 'PUT', {
    message,
    content: base64Content,
    branch,
    ...(sha ? { sha } : {}),
  });
}

async function deleteFile(repoPath: string, message: string, branch: string) {
  const sha = await getFileSha(repoPath, branch);
  if (!sha) return; // already gone
  await gh(`/repos/${OWNER}/${REPO}/contents/${repoPath}`, 'DELETE', {
    message,
    sha,
    branch,
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!TOKEN || !OWNER || !REPO || !ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'Server not configured — missing environment variables' });
  }

  // Validate password server-side
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
    // 1. Get base branch SHA
    const refData = await gh(`/repos/${OWNER}/${REPO}/git/ref/heads/${BASE_BRANCH}`, 'GET') as { object: { sha: string } };
    const baseSha = refData.object.sha;

    // 2. Create new branch
    const branch = `clients-update-${Date.now()}`;
    await gh(`/repos/${OWNER}/${REPO}/git/refs`, 'POST', {
      ref: `refs/heads/${branch}`,
      sha: baseSha,
    });

    // 3. Commit clients.json
    const clientsBase64 = Buffer.from(JSON.stringify(clients, null, 2)).toString('base64');
    await putFile('public/clients.json', clientsBase64, 'Update client data', branch);

    // 4. Commit new images and delete orphaned images in parallel
    await Promise.all([
      ...newImages.map(img => {
        const base64Content = img.base64.includes(',') ? img.base64.split(',')[1] : img.base64;
        return putFile(`public/${img.repoPath}`, base64Content, `Add image ${img.repoPath}`, branch);
      }),
      ...(deletedImages ?? []).map((imgPath: string) =>
        deleteFile(`public${imgPath}`, `Remove image ${imgPath}`, branch)
      ),
    ]);

    // 5. Open PR
    const pr = await gh(`/repos/${OWNER}/${REPO}/pulls`, 'POST', {
      title: 'Update client gallery',
      body: 'Automated update from the admin panel. Review and merge to publish.',
      head: branch,
      base: BASE_BRANCH,
    }) as { html_url: string };

    return res.status(200).json({ prUrl: pr.html_url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
}
