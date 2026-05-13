import type { AzureRegion } from '../types';

/**
 * Comprehensive list of Azure regions, including commercial, government and
 * DoD (Department of Defense) cloud environments.
 *
 * Azure Static Web Apps is currently available in a subset of regions; the
 * `staticWebAppsSupported` flag marks those that are generally available.
 */
export const AZURE_REGIONS: AzureRegion[] = [
  // ── Commercial ──────────────────────────────────────────────────────────────
  { id: 'eastus', name: 'eastus', displayName: 'East US', cloud: 'commercial', staticWebAppsSupported: true },
  { id: 'eastus2', name: 'eastus2', displayName: 'East US 2', cloud: 'commercial', staticWebAppsSupported: true },
  { id: 'westus', name: 'westus', displayName: 'West US', cloud: 'commercial', staticWebAppsSupported: true },
  { id: 'westus2', name: 'westus2', displayName: 'West US 2', cloud: 'commercial', staticWebAppsSupported: true },
  { id: 'westus3', name: 'westus3', displayName: 'West US 3', cloud: 'commercial', staticWebAppsSupported: true },
  { id: 'centralus', name: 'centralus', displayName: 'Central US', cloud: 'commercial', staticWebAppsSupported: true },
  { id: 'northcentralus', name: 'northcentralus', displayName: 'North Central US', cloud: 'commercial', staticWebAppsSupported: false },
  { id: 'southcentralus', name: 'southcentralus', displayName: 'South Central US', cloud: 'commercial', staticWebAppsSupported: true },
  { id: 'westcentralus', name: 'westcentralus', displayName: 'West Central US', cloud: 'commercial', staticWebAppsSupported: false },
  { id: 'northeurope', name: 'northeurope', displayName: 'North Europe', cloud: 'commercial', staticWebAppsSupported: true },
  { id: 'westeurope', name: 'westeurope', displayName: 'West Europe', cloud: 'commercial', staticWebAppsSupported: true },
  { id: 'uksouth', name: 'uksouth', displayName: 'UK South', cloud: 'commercial', staticWebAppsSupported: true },
  { id: 'ukwest', name: 'ukwest', displayName: 'UK West', cloud: 'commercial', staticWebAppsSupported: false },
  { id: 'francecentral', name: 'francecentral', displayName: 'France Central', cloud: 'commercial', staticWebAppsSupported: true },
  { id: 'germanywestcentral', name: 'germanywestcentral', displayName: 'Germany West Central', cloud: 'commercial', staticWebAppsSupported: false },
  { id: 'swedencentral', name: 'swedencentral', displayName: 'Sweden Central', cloud: 'commercial', staticWebAppsSupported: false },
  { id: 'switzerlandnorth', name: 'switzerlandnorth', displayName: 'Switzerland North', cloud: 'commercial', staticWebAppsSupported: false },
  { id: 'eastasia', name: 'eastasia', displayName: 'East Asia', cloud: 'commercial', staticWebAppsSupported: true },
  { id: 'southeastasia', name: 'southeastasia', displayName: 'Southeast Asia', cloud: 'commercial', staticWebAppsSupported: true },
  { id: 'japaneast', name: 'japaneast', displayName: 'Japan East', cloud: 'commercial', staticWebAppsSupported: true },
  { id: 'japanwest', name: 'japanwest', displayName: 'Japan West', cloud: 'commercial', staticWebAppsSupported: false },
  { id: 'australiaeast', name: 'australiaeast', displayName: 'Australia East', cloud: 'commercial', staticWebAppsSupported: true },
  { id: 'australiasoutheast', name: 'australiasoutheast', displayName: 'Australia Southeast', cloud: 'commercial', staticWebAppsSupported: false },
  { id: 'brazilsouth', name: 'brazilsouth', displayName: 'Brazil South', cloud: 'commercial', staticWebAppsSupported: true },
  { id: 'canadacentral', name: 'canadacentral', displayName: 'Canada Central', cloud: 'commercial', staticWebAppsSupported: true },
  { id: 'canadaeast', name: 'canadaeast', displayName: 'Canada East', cloud: 'commercial', staticWebAppsSupported: false },
  { id: 'centralindia', name: 'centralindia', displayName: 'Central India', cloud: 'commercial', staticWebAppsSupported: true },
  { id: 'southindia', name: 'southindia', displayName: 'South India', cloud: 'commercial', staticWebAppsSupported: false },
  { id: 'koreacentral', name: 'koreacentral', displayName: 'Korea Central', cloud: 'commercial', staticWebAppsSupported: true },

  // ── Azure Government (MAG) ───────────────────────────────────────────────────
  { id: 'usgovarizona', name: 'usgovarizona', displayName: 'US Gov Arizona', cloud: 'government', staticWebAppsSupported: true },
  { id: 'usgovtexas', name: 'usgovtexas', displayName: 'US Gov Texas', cloud: 'government', staticWebAppsSupported: true },
  { id: 'usgovvirginia', name: 'usgovvirginia', displayName: 'US Gov Virginia', cloud: 'government', staticWebAppsSupported: true },
  { id: 'usgoviowa', name: 'usgoviowa', displayName: 'US Gov Iowa', cloud: 'government', staticWebAppsSupported: false },

  // ── Azure DoD ────────────────────────────────────────────────────────────────
  { id: 'usdodcentral', name: 'usdodcentral', displayName: 'US DoD Central', cloud: 'dod', staticWebAppsSupported: true },
  { id: 'usdodeast', name: 'usdodeast', displayName: 'US DoD East', cloud: 'dod', staticWebAppsSupported: true },
];

/** Returns Azure AD authority URL based on the chosen cloud environment. */
export function getAuthorityUrl(cloud: string, tenantId: string): string {
  switch (cloud) {
    case 'government':
      return `https://login.microsoftonline.us/${tenantId}`;
    case 'dod':
      return `https://login.microsoftonline.us/${tenantId}`;
    default:
      return `https://login.microsoftonline.com/${tenantId}`;
  }
}

/** Returns the regions filtered by cloud type. */
export function getRegionsByCloud(cloud: string): AzureRegion[] {
  return AZURE_REGIONS.filter((r) => r.cloud === cloud);
}

export const CLOUD_LABELS: Record<string, string> = {
  commercial: 'Azure Commercial',
  government: 'Azure Government (MAG)',
  dod: 'Azure DoD',
};
