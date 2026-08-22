const GITHUB_API = 'https://api.github.com';

function authHeaders() {
  const headers = { Accept: 'application/vnd.github+json' };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

async function fetchUser(username) {
  const res = await fetch(`${GITHUB_API}/users/${username}`, { headers: authHeaders() });
  if (res.status === 404) {
    const err = new Error('GitHub user not found');
    err.status = 404;
    throw err;
  }
  if (!res.ok) {
    const err = new Error('GitHub API request failed');
    err.status = res.status;
    throw err;
  }
  return res.json();
}

async function fetchRepos(username) {
  const repos = [];
  let page = 1;

  // Cap at 3 pages (300 repos) so one lookup can't spiral into dozens of calls
  while (page <= 3) {
    const res = await fetch(
      `${GITHUB_API}/users/${username}/repos?per_page=100&page=${page}&sort=updated`,
      { headers: authHeaders() }
    );
    if (!res.ok) break;
    const batch = await res.json();
    repos.push(...batch);
    if (batch.length < 100) break;
    page += 1;
  }

  return repos;
}

function summarizeRepos(repos) {
  const languageCounts = {};
  let totalStars = 0;
  let totalForks = 0;

  for (const repo of repos) {
    totalStars += repo.stargazers_count || 0;
    totalForks += repo.forks_count || 0;
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
    }
  }

  const topLanguages = Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const topRepos = [...repos]
    .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
    .slice(0, 5)
    .map((r) => ({
      name: r.name,
      url: r.html_url,
      description: r.description,
      stars: r.stargazers_count,
      language: r.language,
    }));

  return { totalStars, totalForks, topLanguages, topRepos };
}

async function getProfileSummary(username) {
  const [user, repos] = await Promise.all([fetchUser(username), fetchRepos(username)]);
  const stats = summarizeRepos(repos);

  return {
    login: user.login,
    name: user.name,
    avatarUrl: user.avatar_url,
    bio: user.bio,
    company: user.company,
    location: user.location,
    blog: user.blog,
    publicRepos: user.public_repos,
    followers: user.followers,
    following: user.following,
    createdAt: user.created_at,
    profileUrl: user.html_url,
    ...stats,
  };
}

module.exports = { getProfileSummary };
