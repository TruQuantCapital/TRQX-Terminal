/* Add these state variables near the other PublishingPage state. */
const [rewriteTone, setRewriteTone] = useState("trqx");
const [rewriting, setRewriting] = useState(false);

/* Add this handler inside PublishingPage. */
async function rewriteForSelectedPlatforms() {
  if (!form.title.trim() || !form.body.trim()) {
    setNotice("Enter a title and master caption before using AI Rewrite.");
    return;
  }

  if (!form.destinations.length) {
    setNotice("Select at least one destination.");
    return;
  }

  setRewriting(true);
  setNotice("");

  try {
    const result = await operationsApi.rewritePublishingContent({
      content_type: form.content_type,
      title: form.title,
      body: form.body,
      ticker: form.ticker || null,
      destinations: form.destinations,
      tone: rewriteTone,
    });

    setForm((current) => ({
      ...current,
      platform_overrides: {
        ...current.platform_overrides,
        ...result.platform_overrides,
      },
      made_with_ai: true,
    }));

    setNotice("AI rewrites generated. Review each caption before publishing.");
  } catch (error) {
    setNotice(`AI Rewrite failed: ${error.message}`);
  } finally {
    setRewriting(false);
  }
}

/* Add near the existing publish controls. */
<select
  value={rewriteTone}
  onChange={(event) => setRewriteTone(event.target.value)}
>
  <option value="trqx">TRQX Voice</option>
  <option value="professional">Professional</option>
  <option value="educational">Educational</option>
  <option value="beginner">Beginner Friendly</option>
  <option value="viral">Viral</option>
  <option value="technical">Technical</option>
</select>

<button
  type="button"
  onClick={rewriteForSelectedPlatforms}
  disabled={rewriting}
>
  {rewriting ? "Rewriting..." : "AI Rewrite for Selected Platforms"}
</button>

/*
Ensure the final publishing payload includes both:
platform_overrides: form.platform_overrides,
made_with_ai: Boolean(form.made_with_ai),
*/
