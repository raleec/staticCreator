import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Badge,
} from '@fluentui/react-components';
import { Dismiss24Regular } from '@fluentui/react-icons';
import { EXAMPLE_SITES, type ExampleSite } from '../../utils/exampleSites';
import type { Site } from '../../types';

interface ExamplesModalProps {
  onClose: () => void;
  /** Called when the user chooses to load an example site. */
  onLoad: (site: Site) => void;
}

export default function ExamplesModal({ onClose, onLoad }: ExamplesModalProps) {
  function handleLoad(example: ExampleSite) {
    // Clone the site with a fresh timestamp so it appears at the top of the list
    const site: Site = {
      ...example.site,
      updatedAt: new Date().toISOString(),
    };
    onLoad(site);
    onClose();
  }

  return (
    <Dialog open onOpenChange={(_, d) => { if (!d.open) onClose(); }}>
      <DialogSurface style={{ maxWidth: 800, width: '95vw' }}>
        <DialogBody>
          <DialogTitle
            action={
              <Button
                appearance="subtle"
                aria-label="Close"
                icon={<Dismiss24Regular />}
                onClick={onClose}
              />
            }
          >
            Example Sites
          </DialogTitle>

          <DialogContent>
            <p className="text-sm text-gray-500 mb-5">
              Load a ready-made example site to explore the builder and get inspired. Each example
              includes realistic pages with navigation, forms, and styled content — all fully
              editable.
            </p>

            <div className="grid gap-4">
              {EXAMPLE_SITES.map((example) => (
                <div
                  key={example.key}
                  className="border border-gray-200 rounded-xl p-5 flex items-start gap-4 hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
                >
                  {/* Icon */}
                  <div className="text-4xl shrink-0 select-none">{example.icon}</div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-gray-900 text-base">{example.site.name}</h3>
                      <Badge appearance="outline" color="informative" size="small">
                        {example.industry}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed mb-3">
                      {example.description}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs text-gray-400">
                        {example.site.pages.length} pages:{' '}
                        {example.site.pages.map((p) => p.name).join(', ')}
                      </span>
                    </div>
                  </div>

                  {/* Load button */}
                  <Button
                    appearance="primary"
                    onClick={() => handleLoad(example)}
                    className="shrink-0"
                  >
                    Load Example
                  </Button>
                </div>
              ))}
            </div>
          </DialogContent>

          <DialogActions>
            <Button appearance="secondary" onClick={onClose}>
              Close
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
