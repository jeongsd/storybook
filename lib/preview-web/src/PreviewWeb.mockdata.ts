import { EventEmitter } from 'events';
import Events from '@storybook/core-events';
import { StoryIndex } from '@storybook/store';

export const componentOneExports = {
  default: {
    title: 'Component One',
    argTypes: {
      foo: { type: { name: 'string' } },
    },
    loaders: [jest.fn()],
    parameters: {
      docs: { container: jest.fn() },
    },
  },
  a: { args: { foo: 'a' }, play: jest.fn() },
  b: { args: { foo: 'b' }, play: jest.fn() },
};
export const componentTwoExports = {
  default: { title: 'Component Two' },
  c: { args: { foo: 'c' } },
};
export const importFn = jest.fn(async (path) => {
  return path === './src/ComponentOne.stories.js' ? componentOneExports : componentTwoExports;
});

export const projectAnnotations = {
  globals: { a: 'b' },
  globalTypes: {},
  decorators: [jest.fn((s) => s())],
  render: jest.fn(),
  renderToDOM: jest.fn(),
};
export const getProjectAnnotations = () => projectAnnotations;

export const storyIndex: StoryIndex = {
  v: 3,
  stories: {
    'component-one--a': {
      title: 'Component One',
      name: 'A',
      importPath: './src/ComponentOne.stories.js',
    },
    'component-one--b': {
      title: 'Component One',
      name: 'B',
      importPath: './src/ComponentOne.stories.js',
    },
    'component-two--c': {
      title: 'Component Two',
      name: 'C',
      importPath: './src/ComponentTwo.stories.js',
    },
  },
};
export const getStoryIndex = () => storyIndex;

export const emitter = new EventEmitter();
export const mockChannel = {
  on: emitter.on.bind(emitter),
  off: emitter.off.bind(emitter),
  removeListener: emitter.off.bind(emitter),
  emit: jest.fn(emitter.emit.bind(emitter)),
  // emit: emitter.emit.bind(emitter),
};

export const waitForEvents = (events: string[]) => {
  // We've already emitted a render event. NOTE if you want to test a second call,
  // ensure you call `mockChannel.emit.mockClear()` before `waitForRender`
  if (mockChannel.emit.mock.calls.find((call) => events.includes(call[0]))) {
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    const listener = () => {
      events.forEach((event) => mockChannel.off(event, listener));
      resolve(null);
    };
    events.forEach((event) => mockChannel.on(event, listener));

    // Don't wait too long
    waitForQuiescence().then(() => reject(new Error('Event was not emitted in time')));
  });
};

// The functions on the preview that trigger rendering don't wait for
// the async parts, so we need to listen for the "done" events
export const waitForRender = () =>
  waitForEvents([
    Events.STORY_RENDERED,
    Events.DOCS_RENDERED,
    Events.STORY_THREW_EXCEPTION,
    Events.STORY_ERRORED,
    Events.STORY_MISSING,
  ]);

export const waitForQuiescence = async () => new Promise((r) => setTimeout(r, 100));
