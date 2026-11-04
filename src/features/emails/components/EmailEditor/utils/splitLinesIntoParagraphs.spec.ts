import { describe, expect, it } from '@jest/globals';

/** @jest-environment jsdom */
import splitLinesIntoParagraphs from './splitLinesIntoParagraphs';

describe('splitLinesIntoParagraphs()', () => {
  it('leaves html without line breaks unchanged', () => {
    const html = '<p>First</p><p>Second <b>bold</b></p>';
    expect(splitLinesIntoParagraphs(html)).toEqual(html);
  });

  it('turns top-level lines into paragraphs', () => {
    expect(
      splitLinesIntoParagraphs('Hi all,<br>meeting is <b>tomorrow</b><br>bye')
    ).toEqual('<p>Hi all,</p><p>meeting is <b>tomorrow</b></p><p>bye</p>');
  });

  it('keeps styled spans on one line in the same paragraph', () => {
    expect(
      splitLinesIntoParagraphs(
        '<span style="color: red">Hi all,</span><br style="color: red">' +
          '<span style="color: red">meeting is </span><b>tomorrow</b>'
      )
    ).toEqual('<p>Hi all,</p><p>meeting is <b>tomorrow</b></p>');
  });

  it('keeps variables', () => {
    expect(
      splitLinesIntoParagraphs(
        'Hi <span data-slug="first_name">First name</span><br>bye'
      )
    ).toEqual(
      '<p>Hi <span data-slug="first_name">First name</span></p><p>bye</p>'
    );
  });

  it('splits paragraphs and headings into several of the same tag', () => {
    expect(
      splitLinesIntoParagraphs(
        '<h2>Title<br>Subtitle</h2><p class="x">Street 1<br>Stockholm</p>'
      )
    ).toEqual(
      '<h2>Title</h2><h2>Subtitle</h2>' +
        '<p class="x">Street 1</p><p class="x">Stockholm</p>'
    );
  });

  it('splits lines inside a div into paragraphs', () => {
    expect(splitLinesIntoParagraphs('<div class="x">One<br>Two</div>')).toEqual(
      '<div class="x"><p>One</p><p>Two</p></div>'
    );
  });

  it('splits inline formatting that spans a line break', () => {
    expect(splitLinesIntoParagraphs('<b>One<br>Two</b>')).toEqual(
      '<p><b>One</b></p><p><b>Two</b></p>'
    );
  });

  it('does not wrap block elements in a paragraph', () => {
    expect(splitLinesIntoParagraphs('<p>One</p><br><p>Two</p>')).toEqual(
      '<p>One</p><p>Two</p>'
    );
  });
});
