<script>
/* Outside Claude: give the calculator's save buttons a normal browser download. */
(function(){
  if (window.claude && window.claude.use) return;
  var dl = { save: function(o){
    var blob = new Blob([o.data], {type: 'text/html;charset=utf-8'});
    var url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = o.filename || 'download.html'; a.rel = 'noopener';
    document.body.appendChild(a); a.click();
    setTimeout(function(){ a.remove(); URL.revokeObjectURL(url); }, 4000);
    return Promise.resolve({status: 'saved'});
  }};
  window.claude = { use: function(n){ return Promise.resolve(n === 'downloads' ? dl : null); } };
})();
</script>
