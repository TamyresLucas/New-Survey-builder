const sampleText = "The quick brown fox jumps over the lazy dog";

interface TextStyleRowProps {
  token: string;
  cssClass: string;
  description: string;
  className: string;
}

const TextStyleRow = ({ token, cssClass, description, className }: TextStyleRowProps) => (
  <div className="space-y-2 pb-4 border-b border-border last:border-b-0 last:pb-0">
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm font-medium text-foreground shrink-0">{token}</span>
      <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded truncate">{cssClass}</code>
    </div>
    <div className={`font-sans text-foreground ${className}`}>
      {sampleText}
    </div>
    <div className="text-xs text-muted-foreground">{description}</div>
  </div>
);

export const TypeScale = () => {
  return (
    <div className="space-y-12">
      <div className="space-y-2">
        <h2 className="font-sans text-2xl font-semibold border-b pb-2">Typography Styles</h2>
        <p className="text-muted-foreground">Pre-configured text styles following shadcn/ui patterns. All examples use the currently selected font family.</p>
      </div>

      {/* Text Scale Examples */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Text Scale Examples</h3>
          <p className="text-sm text-muted-foreground">Visual examples of each font size from the modular type scale.</p>
        </div>

        <div className="space-y-4 p-6 border border-border rounded-lg bg-card">
          <TextStyleRow
            token="text-4xl"
            cssClass="text-4xl (36px / 2.25rem)"
            description="Use for page titles and primary headings (H1)"
            className="text-4xl font-bold tracking-tight"
          />
          <TextStyleRow
            token="text-3xl"
            cssClass="text-3xl (30px / 1.875rem)"
            description="Use for section headings (H2)"
            className="text-3xl font-semibold tracking-tight"
          />
          <TextStyleRow
            token="text-2xl"
            cssClass="text-2xl (24px / 1.5rem)"
            description="Use for subsection headings (H3)"
            className="text-2xl font-semibold"
          />
          <TextStyleRow
            token="text-xl"
            cssClass="text-xl (20px / 1.25rem)"
            description="Use for card titles and minor headings (H4)"
            className="text-xl font-semibold"
          />
          <TextStyleRow
            token="text-lg"
            cssClass="text-lg (18px / 1.125rem)"
            description="Use for emphasized statements and lead paragraphs"
            className="text-lg"
          />
          <TextStyleRow
            token="text-base"
            cssClass="text-base (16px / 1rem)"
            description="Default body text for paragraphs and content"
            className="text-base"
          />
          <TextStyleRow
            token="text-sm"
            cssClass="text-sm (14px / 0.875rem)"
            description="Use for form labels, metadata, and secondary content"
            className="text-sm"
          />
          <TextStyleRow
            token="text-xs"
            cssClass="text-xs (12px / 0.75rem)"
            description="Use for captions, helper text, and fine print"
            className="text-xs"
          />
        </div>
      </div>

      {/* Headings */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Semantic Headings</h3>
          <p className="text-sm text-muted-foreground">Pre-configured heading styles with proper hierarchy.</p>
        </div>

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

          <div className="space-y-3 pb-6 border-b border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">H4</span>
              <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">text-xl font-semibold tracking-tight</code>
            </div>
            <div className="font-heading text-foreground text-xl font-semibold tracking-tight">
              People stopped telling jokes
            </div>
            <div className="text-xs text-muted-foreground">Use for card titles and minor headings</div>
          </div>

          <div className="space-y-3 pb-6 border-b border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">H5</span>
              <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">text-lg font-semibold</code>
            </div>
            <div className="font-heading text-foreground text-lg font-semibold">
              The Royal Decree Was Announced
            </div>
            <div className="text-xs text-muted-foreground">Use for sub-subsection headings</div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">H6</span>
              <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">text-base font-semibold</code>
            </div>
            <div className="font-heading text-foreground text-base font-semibold">
              Article footnotes and references
            </div>
            <div className="text-xs text-muted-foreground">Use for smallest heading level</div>
          </div>
        </div>
      </div>

      {/* Body Text */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Body Text</h3>
          <p className="text-sm text-muted-foreground">Text styles for content and paragraphs.</p>
        </div>

        <div className="space-y-6 p-6 border border-border rounded-lg bg-card">
          <div className="space-y-3 pb-6 border-b border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Paragraph</span>
              <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">text-base leading-relaxed</code>
            </div>
            <div className="font-body text-foreground text-base leading-relaxed">
              The king, seeing how much happier his subjects were, realized the error of his ways and repealed the joke tax. The kingdom was filled with laughter once more, and jesters returned to every corner of the realm.
            </div>
            <div className="text-xs text-muted-foreground">Default body text with comfortable line height</div>
          </div>

          <div className="space-y-3 pb-6 border-b border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Lead</span>
              <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">text-xl text-muted-foreground</code>
            </div>
            <div className="font-body text-muted-foreground text-xl leading-relaxed">
              A modal dialog that interrupts the user with important content and expects a response.
            </div>
            <div className="text-xs text-muted-foreground">Use for introduction paragraphs and subtitles</div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Small Body</span>
              <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">text-sm leading-normal</code>
            </div>
            <div className="font-body text-foreground text-sm leading-normal">
              This is smaller body text, useful for secondary content areas, sidebars, or supporting information that doesn't need as much visual prominence.
            </div>
            <div className="text-xs text-muted-foreground">Use for secondary content and supporting text</div>
          </div>
        </div>
      </div>

      {/* Font Weights Examples */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Font Weight Examples</h3>
          <p className="text-sm text-muted-foreground">Visual examples of each font weight.</p>
        </div>

        <div className="space-y-4 p-6 border border-border rounded-lg bg-card">
          <div className="space-y-2 pb-4 border-b border-border">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-foreground shrink-0">font-normal</span>
              <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">400</code>
            </div>
            <div className="font-sans text-foreground text-lg font-normal">
              {sampleText}
            </div>
          </div>
          <div className="space-y-2 pb-4 border-b border-border">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-foreground shrink-0">font-medium</span>
              <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">500</code>
            </div>
            <div className="font-sans text-foreground text-lg font-medium">
              {sampleText}
            </div>
          </div>
          <div className="space-y-2 pb-4 border-b border-border">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-foreground shrink-0">font-semibold</span>
              <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">600</code>
            </div>
            <div className="font-sans text-foreground text-lg font-semibold">
              {sampleText}
            </div>
          </div>
          <div className="space-y-2 pb-4 border-b border-border">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-foreground shrink-0">font-bold</span>
              <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">700</code>
            </div>
            <div className="font-sans text-foreground text-lg font-bold">
              {sampleText}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-foreground shrink-0">font-extrabold</span>
              <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">800</code>
            </div>
            <div className="font-sans text-foreground text-lg font-extrabold">
              {sampleText}
            </div>
          </div>
        </div>
      </div>

      {/* Line Height Examples */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Line Height Examples</h3>
          <p className="text-sm text-muted-foreground">Visual examples of each line height with multi-line text.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border border-border rounded-lg bg-card space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">leading-none</span>
              <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">1</code>
            </div>
            <div className="font-sans text-foreground text-base leading-none bg-muted/30 p-2 rounded">
              The quick brown fox jumps over the lazy dog. This text demonstrates the line height.
            </div>
          </div>
          <div className="p-4 border border-border rounded-lg bg-card space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">leading-tight</span>
              <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">1.25</code>
            </div>
            <div className="font-sans text-foreground text-base leading-tight bg-muted/30 p-2 rounded">
              The quick brown fox jumps over the lazy dog. This text demonstrates the line height.
            </div>
          </div>
          <div className="p-4 border border-border rounded-lg bg-card space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">leading-snug</span>
              <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">1.375</code>
            </div>
            <div className="font-sans text-foreground text-base leading-snug bg-muted/30 p-2 rounded">
              The quick brown fox jumps over the lazy dog. This text demonstrates the line height.
            </div>
          </div>
          <div className="p-4 border border-border rounded-lg bg-card space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">leading-normal</span>
              <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">1.5</code>
            </div>
            <div className="font-sans text-foreground text-base leading-normal bg-muted/30 p-2 rounded">
              The quick brown fox jumps over the lazy dog. This text demonstrates the line height.
            </div>
          </div>
          <div className="p-4 border border-border rounded-lg bg-card space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">leading-relaxed</span>
              <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">1.625</code>
            </div>
            <div className="font-sans text-foreground text-base leading-relaxed bg-muted/30 p-2 rounded">
              The quick brown fox jumps over the lazy dog. This text demonstrates the line height.
            </div>
          </div>
          <div className="p-4 border border-border rounded-lg bg-card space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">leading-loose</span>
              <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">2</code>
            </div>
            <div className="font-sans text-foreground text-base leading-loose bg-muted/30 p-2 rounded">
              The quick brown fox jumps over the lazy dog. This text demonstrates the line height.
            </div>
          </div>
        </div>
      </div>

      {/* Utility Text */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Utility Text Styles</h3>
          <p className="text-sm text-muted-foreground">Common text patterns for UI elements.</p>
        </div>

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

          <div className="space-y-3 pb-6 border-b border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Muted</span>
              <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">text-sm text-muted-foreground</code>
            </div>
            <div className="font-sans text-muted-foreground text-sm">
              Enter your email address.
            </div>
            <div className="text-xs text-muted-foreground">Use for helper text and descriptions</div>
          </div>

          <div className="space-y-3 pb-6 border-b border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Caption</span>
              <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">text-xs text-muted-foreground</code>
            </div>
            <div className="font-sans text-muted-foreground text-xs">
              Last updated 5 minutes ago
            </div>
            <div className="text-xs text-muted-foreground">Use for timestamps, footnotes, and fine print</div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Overline</span>
              <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">text-xs font-semibold uppercase tracking-widest</code>
            </div>
            <div className="font-sans text-foreground text-xs font-semibold uppercase tracking-widest">
              Featured Article
            </div>
            <div className="text-xs text-muted-foreground">Use for category labels and section identifiers</div>
          </div>
        </div>
      </div>
    </div>
  );
};
