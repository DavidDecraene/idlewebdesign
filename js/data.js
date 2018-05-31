
/* jshint esversion: 6 */
(function() {
  const webevo = window.webevo;

  webevo.data = {
    phases : [
      {
        id: 'prehistoric', template: `
        <h1 class="title"></h1>
        <p class="log">You wrote your first lines of html code</p>
        <div class="body"></div>
        <div class="icons"></div>
        <a href="#" class="visit">Click here</a> for some obnoxious self-promotion.
        <div class="footer">
          <div class="footer-links">
            <a href="#">Hyperlink</a> | <a href="#">Hyperlink</a> | <a href="#">Hyperlink</a> | <a href="#">Hyperlink</a> | <a href="#">Hyperlink</a>
          </div>
          <hr/>
          <div class="text">This is your footer. You haven\'t figured out what it is for yet.</div>
        </div>
        <div class="automation" style="display:none">
          <hr/>
          <h2>Referrals</h2>
        </div>
        <div class="research" style="display:none">
          <hr/>
          <h2>Research</h2>
        </div>
        `
      }
    ],
    research : [
      {
        id: 'cursors',
        description: 'Unlock the power of customizable cursors.',
        actions: { addClass: 'research1' },
        cost: { value : 100, type: 'income'}
      },
      {
        id: 'background1',
        description: 'Learn about css background-color',
        actions: {
          addClass: 'background1',
          title: 'Everything must be grey'
        },
        cost: { value : 200, type: 'income'},
        requirements: ['cursors']
      },
      {
        id: 'font1',
        description: 'Discover the times new roman font-family',
        actions: { addClass: 'font1' },
        cost: { value : 400, type: 'income'},
        requirements: ['cursors']
      },
      {
        id: 'counters',
        description: 'I heard visitor counters are the new deal',
        actions: { odometer: 'minimal', footer: 'This is your footer.' },
        cost: { value : 400, type: 'income'},
        requirements: ['font1']
      },
      {
        id: 'background2',
        description: 'Hmm, we want a more modern background',
        actions: {
          addClass: 'background2', removeClass: 'background1', title: 'How about this?'
        },
        cost: { value : 600, type: 'income'},
        requirements: ['counters']
      },
      {
        id: 'font2',
        description: 'Ooh, Comic Sans',
        actions: {
          addClass: 'font2', removeClass: 'font1'
        },
        cost: { value : 600, type: 'income'},
        requirements: ['counters']
      },
      {
        id: 'textShadows',
        description: 'TextShadows sound awesome',
        actions: {
          addClass: 'text-shadows'
        },
        cost: { value : 800, type: 'income'},
        requirements: ['font2', 'background2']
      },
      {
        id: 'animatedGifs',
        description: 'Let\'s spice up the site with the latest of the latest: Animated GIFs.',
        actions: {
          gif : {
            title: 'img/hot.gif'
          }
        },
        cost: { value : 1000, type: 'income'},
        requirements: ['textShadows']
      },
      {
        id: 'underConstruction',
        description: 'Let\'s spice up the site with the latest of the latest: Animated GIFs.',
        actions: {
          gif : {
            body: 'img/tM18j.gif'
          }
        },
        cost: { value : 1000, type: 'income'},
        requirements: ['textShadows']
      },
      {
        id: 'counters2',
        description: 'Get up to speed with the latest developments in odometer visualisation.',
        actions: { odometer: 'train-station' },
        cost: { value : 1500, type: 'income'},
        requirements: ['underConstruction']
      },
      {
        id: 'blink',
        description: 'Apparently, it is possible to make some text blink to attract the attention of the user.',
        actions: { blink: '"Horrible Blink Effect"' },
        cost: { value : 100, type: 'income'},
        requirements: ['counters2']
      },
      {
        id: 'blink2',
        description: 'Oh no, That blink must go.',
        actions: { blink: false },
        cost: { value : 10000, type: 'income'},
        requirements: ['blink']
      },
      {
        id: 'buttons',
        description: 'Actual html button elements.',
        actions: { removeClass: 'button1', addClass: 'button2' },
        cost: { value : 1500, type: 'income'},
        requirements: ['blink']
      },
      {
        id: 'icon1',
        description: 'Credit the text editor.',
        actions: { addIcon: 'img/notepad.gif' },
        cost: { value : 1500, type: 'income'},
        requirements: ['blink']
      },
      {
        id: 'icon2',
        description: 'Promote the use of the latest web browsers.',
        actions: { addIcon: 'img/ns_logo.gif' },
        cost: { value : 1500, type: 'income'},
        requirements: ['blink']
      },
      {
        id: 'icon3',
        description: 'Promote the use of the latest web browsers.',
        actions: { addIcon: 'img/ie_logo.gif' },
        cost: { value : 1500, type: 'income'},
        requirements: ['blink']
      },
      {
        id: 'icon4',
        description: 'Support the campaign against frames.',
        actions: { addIcon: 'img/noframes.gif' },
        cost: { value : 1500, type: 'income'},
        requirements: ['blink']
      },
      {
        id: 'background3',
        description: 'Use a fancy repeating background gif to impress your visitors.',
        actions: { addClass: 'background3', addIncome: 0.1, title: 'Now we are getting somewhere' },
        cost: { value : 1500, type: 'income'},
        requirements: ['icon2', 'icon3']
      }
    ]
  };

})();
