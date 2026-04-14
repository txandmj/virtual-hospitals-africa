// deno-lint-ignore-file no-process-global
const port = 8000 + parseInt(process.env.PR_NUMBER);
const url = `http://${process.env.PREVIEW_EC2_IP}:${port}`;
const body = `### Preview Environment\n\n**${url}**\n\n_Redeployed on each push. Torn down when this PR is closed._`;

const { data: comments } = await github.rest.issues.listComments({
  owner: context.repo.owner,
  repo: context.repo.repo,
  issue_number: parseInt(process.env.PR_NUMBER),
});

const existing = comments.find(c => c.body.includes('Preview Environment'));

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
