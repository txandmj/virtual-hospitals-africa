// deno-lint-ignore-file no-process-global
const { data: comments } = await github.rest.issues.listComments({
  owner: context.repo.owner,
  repo: context.repo.repo,
  issue_number: parseInt(process.env.PR_NUMBER),
});

const existing = comments.find(c => c.body.includes('Preview Environment'));

const body = `### Preview Environment\n\nTorn down.`;

if (existing) {
  await github.rest.issues.updateComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    comment_id: existing.id,
    body,
  });
} else {
  await github.rest.issues.createComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: parseInt(process.env.PR_NUMBER),
    body,
  });
}
