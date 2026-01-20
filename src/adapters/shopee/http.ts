import fetch from 'node-fetch';

export async function shopeePost(url: string, body: unknown, headers: Record<string, string>) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify(body),
    timeout: 10000
  });

  const text = await res.text();

  if (!res.ok) {
    const err = new Error(`SHOPEE_HTTP_${res.status}: ${text}`);
    (err as any).status = res.status;
    throw err;
  }

  return JSON.parse(text);
}
