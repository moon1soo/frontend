import { BestcarePage } from './app.po';

describe('bestcare App', () => {
  let page: BestcarePage;

  beforeEach(() => {
    page = new BestcarePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
