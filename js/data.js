
/* jshint esversion: 6 */
(function() {
  const webevo = window.webevo;

  webevo.data = {
    phases : [
      {
        id: 'prehistoric', template: `
        <h1 class="title">The start of it all</h1>
        <p class="log">You wrote your first lines of html code</p>
        <a href="#" class="visit">Click here</a> for some obnoxious self-promotion.
        <div class="automation" style="display:none">
          <hr/>
          <h2>Referrals</h2>
        </div>
        <div class="research" style="display:none">
          <hr/>
          <h2>Research</h2>
        </div>
        <div class="footer">
          <hr/>
          <div class="text">This is your footer. You haven\'t figured out what it is for yet.</div>
        </div>
        `
      }
    ],
    research : [
      {
        id: 'cursors', phase: 'prehistoric',
        description: 'Unlock the power of customizable cursors.',
        css: 'research1',
        cost: { value : 100, type: 'income'}
      },
      {
        id: 'background1', phase: 'prehistoric',
        description: 'Lean about css background-color',
        css: 'background1',
        title: 'Everything must be grey',
        cost: { value : 100, type: 'income'},
        requirements: ['cursors']
      },
      {
        id: 'font1', phase: 'prehistoric',
        description: 'Discover the times new roman font-family',
        css: 'background1',
        cost: { value : 100, type: 'income'},
        requirements: ['cursors']
      }
    ]
  }

})();
