(function(root){
function parseCard(text){
 const result={};const t=String(text).toUpperCase();
 const unique=a=>{const values=[...new Set(a)];return values.length===1?values[0]:null;};
 for(const [key,label,size] of [['roll',/ROLL\s*(?:NO)?[.:\s]*/g,6],['registration',/REG(?:ISTRATION)?\.?\s*(?:NO)?[.:\s]*/g,10]]){
  const direct=[...t.matchAll(new RegExp(label.source+'(\\d{'+size+'})(?!\\d)','g'))].map(m=>m[1]);
  const standalone=t.split(/\r?\n/).map(s=>s.trim()).filter(s=>new RegExp('^\\d{'+size+'}$').test(s));
  const value=unique([...direct,...(label.test(t)?standalone:[])]);if(value)result[key]=value;
 }
 const year=unique([...t.matchAll(/EXAMINATION\s*[-–—:]?\s*(20\d{2})/g)].map(m=>m[1]));if(year)result.year=year;
 const boards=['DINAJPUR','DHAKA','RAJSHAHI','CUMILLA','JASHORE','CHATTOGRAM','BARISAL','SYLHET','MYMENSINGH','MADRASAH','TECHNICAL'];
 const board=unique(boards.filter(b=>new RegExp('\\b'+b+'\\b').test(t)));if(board)result.board=board.toLowerCase();
 if(/\bHSC\b|HIGHER\s+SECONDARY\s+CERTIFICATE/.test(t))result.exam='hsc';
 return result;
}
root.PARSE_CARD=parseCard;if(typeof module!=='undefined')module.exports=parseCard;
})(globalThis);
