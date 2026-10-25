export function normalizeIndicatorName(name: string): string {
  return name
    .toUpperCase()
    .replace(/[_\s-]*(ADAPTER|ADPTER|INDICATOR)$/g, '')
    .replace(/[^A-Z0-9]/g, '');
}