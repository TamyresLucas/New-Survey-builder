export const TypeScale = () => {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="font-sans text-2xl font-semibold border-b pb-2">Typography Styles</h2>
        <p className="text-muted-foreground">Pre-configured text styles following shadcn/ui patterns. All examples use the currently selected font family.</p>
      </div>

      {/* Headings */}
      <div className="space-y-6">
        <div className="text-lg font-semibold text-foreground">Headings</div>

        <div className="space-y-6 p-6 border border-border rounded-lg bg-card">
          <div className="space-y-3 pb-6 border-b border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">H1</span>
              <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">text-4xl font-extrabold tracking-tight</code>
            </div>
            <div className="font-heading text-foreground text-4xl font-extrabold tracking-tight">
              Taxing Laughter: The Joke Tax Chronicles
            </div>
            <div className="text-xs text-muted-foreground">Use for page titles and primary headings</div>
          </div>

          <div className="space-y-3 pb-6 border-b border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">H2</span>
              <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">text-3xl font-semibold tracking-tight</code>
            </div>
            <div className="font-heading text-foreground text-3xl font-semibold tracking-tight">
              The People of the Kingdom
            </div>
            <div className="text-xs text-muted-foreground">Use for section headings</div>
          </div>

          <div className="space-y-3 pb-6 border-b border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">H3</span>
              <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">text-2xl font-semibold tracking-tight</code>
            </div>
            <div className="font-heading text-foreground text-2xl font-semibold tracking-tight">
              The Joke Tax
            </div>
            <div className="text-xs text-muted-foreground">Use for subsection headings</div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">H4</span>
              <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">text-xl font-semibold tracking-tight</code>
            </div>
            <div className="font-heading text-foreground text-xl font-semibold tracking-tight">
              People stopped telling jokes
            </div>
            <div className="text-xs text-muted-foreground">Use for card titles and minor headings</div>
          </div>
        </div>
      </div>

      {/* Body Text */}
      <div className="space-y-6">
        <div className="text-lg font-semibold text-foreground">Body Text</div>

        <div className="space-y-6 p-6 border border-border rounded-lg bg-card">
          <div className="space-y-3 pb-6 border-b border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Paragraph</span>
              <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">text-base leading-relaxed</code>
            </div>
            <div className="font-body text-foreground text-base leading-relaxed">
              The king, seeing how much happier his subjects were, realized the error of his ways and repealed the joke tax. The kingdom was filled with laughter once more.
            </div>
            <div className="text-xs text-muted-foreground">Default body text with comfortable line height</div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Lead</span>
              <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">text-xl text-muted-foreground</code>
            </div>
            <div className="font-body text-muted-foreground text-xl leading-relaxed">
              A modal dialog that interrupts the user with important content and expects a response.
            </div>
            <div className="text-xs text-muted-foreground">Use for introduction paragraphs and subtitles</div>
          </div>
        </div>
      </div>

      {/* Utility Text */}
      <div className="space-y-6">
        <div className="text-lg font-semibold text-foreground">Utility Text</div>

        <div className="space-y-6 p-6 border border-border rounded-lg bg-card">
          <div className="space-y-3 pb-6 border-b border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Large</span>
              <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">text-lg font-semibold</code>
            </div>
            <div className="font-sans text-foreground text-lg font-semibold">
              Are you absolutely sure?
            </div>
            <div className="text-xs text-muted-foreground">Use for emphasized statements and confirmations</div>
          </div>

          <div className="space-y-3 pb-6 border-b border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Small / Label</span>
              <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">text-sm font-medium leading-none</code>
            </div>
            <div className="font-sans text-foreground text-sm font-medium leading-none">
              Email address
            </div>
            <div className="text-xs text-muted-foreground">Use for form labels and metadata</div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Muted</span>
              <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">text-sm text-muted-foreground</code>
            </div>
            <div className="font-sans text-muted-foreground text-sm">
              Enter your email address.
            </div>
            <div className="text-xs text-muted-foreground">Use for helper text and descriptions</div>
          </div>
        </div>
      </div>
    </div>
  );
};
