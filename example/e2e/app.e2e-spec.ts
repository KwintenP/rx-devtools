import { RxDevtoolsPage } from './app.po';

describe('rx-devtools App', () => {
  let page: RxDevtoolsPage;

  beforeEach(() => {
    page = new RxDevtoolsPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
