import { addons } from '@storybook/manager-api';
import { create } from '@storybook/theming/create';

const theme = create({
    base: 'light',
    brandTitle: 'foresight',
    fontBase: '"Figtree", sans-serif',
});

addons.setConfig({
    theme,
});
