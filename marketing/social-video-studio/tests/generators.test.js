import test from 'node:test';import assert from 'node:assert/strict';
import { generateScript } from '../src/script_generator.js';import { generateCaption } from '../src/caption_generator.js';
test('script never invents religious content when bank is empty',()=>{const s=generateScript('quran',[]);assert.equal(s.approvedText,null);assert.equal(s.duration,13)});
test('only provided approved text is used',()=>{const s=generateScript('general',[{text:'Onaylı metin',source:'Kaynak'}]);assert.equal(s.approvedText,'Onaylı metin');assert.equal(s.approvedSource,'Kaynak')});
test('caption includes platform hashtags',()=>{const c=generateCaption('dhikr',generateScript('dhikr'));assert.ok(c.hashtags.includes('#HuzurUygulaması'));assert.ok(c.caption.length>30)});
test('narration is concise and does not repeat the hook',()=>{const s=generateScript('general');assert.ok(s.narration.length<220);assert.equal(s.narration.includes(s.hook),false)});
