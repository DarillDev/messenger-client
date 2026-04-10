import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();

// jsdom does not implement Element.prototype.scrollTo — needed for CDK virtual scroll viewport
Element.prototype.scrollTo = jest.fn() as unknown as typeof Element.prototype.scrollTo;
