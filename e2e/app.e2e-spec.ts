import { ActMapsPage } from './app.po';

describe('act-maps App', () => {
  let page: ActMapsPage;

  beforeEach(() => {
    page = new ActMapsPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
