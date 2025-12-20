# Badge & Tag Component

Badges and Tags are compact elements used to label items with status, categories, or specific features. They provide quick context and visual categorization.

## Badges

Badges are used for status indicators, categories, or labeling. They come in various color schemes and can be interactive.

### Anatomy

-   **Container**: Flex row, centered.
-   **Dimensions**:
    -   Height: `27px`
    -   Min-Width: `56px`
    -   Padding: `4px 8px`
    -   Gap: `8px`
-   **Shape**: `rounded-[16px]` (Pill)
-   **Typography**:
    -   Font: `Open Sans`
    -   Weight: `400` (Regular)
    -   Size: `14px`
    -   Line Height: `19px`
    -   Color: `text-on-surface` (`#232323` / `--foundation-off-black`)
-   **Icon**:
    -   Primary: `9px` circular dot (Ellipse)
    -   Secondary: `16px` icon (e.g., `link-slash-solid`, `arrow-up-right-from-square-solid`)

### Schemes & States

Badges have two primary states: **Default** (Inactive) and **Active**. They support multiple color schemes mapped to the chart/foundation palettes.

#### Purple
-   **Token Mapping**: `chart-grape`
-   **Main Color**: `#8E25D0` (`--foundation-chart-grape`)
| State | Background | Border | Dot/Icon Color |
| :--- | :--- | :--- | :--- |
| **Default** | `#FFFFFF` (`--foundation-white`) | `#E0E4FF` (`--foundation-neutral-scale-primary-20`) | `#8E25D0` |
| **Active** | `#E8DAFF` (`--foundation-chart-grape-20`) | `#8E25D0` | `#8E25D0` |

#### Green
-   **Token Mapping**: `foundation-green` / `chart-avocado`
-   **Main Color**: `#00A078` (`--foundation-green`)
| State | Background | Border | Dot/Icon Color |
| :--- | :--- | :--- | :--- |
| **Default** | `#FFFFFF` | `#E0E4FF` | `#00A078` |
| **Active** | `#CEF1E1` (`--foundation-chart-avocado-10`) | `#00A078` | `#00A078` |

#### Grey
-   **Token Mapping**: `chart-grey`
-   **Main Color**: `#707D89` (`--foundation-chart-grey`)
| State | Background | Border | Dot/Icon Color |
| :--- | :--- | :--- | :--- |
| **Default** | `#FFFFFF` | `#E0E4FF` | `#707D89` |
| **Active** | `#E2E5E7` (`--foundation-chart-grey-20`) | `#707D89` | `#707D89` |

#### Red
-   **Token Mapping**: `foundation-coral` / `chart-apple`
-   **Main Color**: `#EF576B` (`--foundation-coral`)
| State | Background | Border | Dot/Icon Color |
| :--- | :--- | :--- | :--- |
| **Default** | `#FFFFFF` | `#E0E4FF` | `#EF576B` |
| **Active** | `#FEEFF1` (`--foundation-coral-light`) | `#EF576B` | `#EF576B` |

#### Periwinkle
-   **Token Mapping**: `foundation-periwinkle-dark`
-   **Main Color**: `#5568F2` (`--foundation-periwinkle-dark`)
| State | Background | Border | Dot/Icon Color |
| :--- | :--- | :--- | :--- |
| **Default** | `#FFFFFF` | `#E0E4FF` | `#5568F2` |
| **Active** | `#D4E2FF` (`--tags-tag-bg--10`) | `#5568F2` | `#5568F2` |

#### Yellow
-   **Token Mapping**: `foundation-tangerine`
-   **Main Color**: `#EC6B09` (`--foundation-tangerine`)
| State | Background | Border | Dot/Icon Color |
| :--- | :--- | :--- | :--- |
| **Default** | `#FFFFFF` | `#E0E4FF` | `#EC6B09` |
| **Active** | `#FFFCF2` (`--tags-tag-bg--11`) | `#EC6B09` | `#EC6B09` |

#### Cyan
-   **Token Mapping**: Custom / New
-   **Main Color**: `#0192D0`
| State | Background | Border | Dot/Icon Color |
| :--- | :--- | :--- | :--- |
| **Default** | `#FFFFFF` | `#E0E4FF` | `#0192D0` |
| **Active** | `#DFF3FB` | `#0192D0` | `#0192D0` |

---

## Status Tags (Legacy/Header)

Used primarily in the Header to indicate the survey's lifecycle state.

-   **Shape**: `rounded-[16px]`
-   **Padding**: `px-2 py-1`
-   **Typography**: `text-sm font-normal` (Open Sans)
-   **Height**: Fixed `h-[27px]`
-   **Border**: 1px solid

### Variants

| Status | Background | Border | Text Color | Label |
| :--- | :--- | :--- | :--- | :--- |
| **Draft** | `bg-surface-container-high` | `border-outline` | `text-on-surface` | Draft |
| **Active** | `bg-success-container` | `border-success` | `text-on-success-container` | Active |
| **Stopped** | `bg-error-container` | `border-error` | `text-on-error-container` | Stopped |
| **Pending** | `bg-warning-container` | `border-warning` | `text-on-warning-container` | Pending update |

## Feature Tags

Used within components to indicate enabled features.

-   **Shape**: `rounded-full`
-   **Padding**: `px-2 py-0.5`
-   **Typography**: `text-xs font-medium`
-   **Background**: `bg-primary-container`
-   **Text**: `text-on-primary-container`
