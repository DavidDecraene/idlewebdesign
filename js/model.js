/* jshint esversion: 6 */
(function() {
  const webevo = window.webevo;

  webevo.ResearchService = class {
    constructor(model) {
      this.model = model;
      this.unlocked = [];
      this.unlockable = [];
      this.locked = [];
      this.map = { };
      webevo.data.research.forEach(r => {
        this.map[r.id] = r;
        this.locked.push(r);
      });
     this.hidden = true;
    }

    unlock(id) {

    }

    notifyCounter(counter) {
      if (this.hidden ) {
        if(counter.iCount >= 100) {
          this.hidden = false;
          $('.research').show();
        } else return;
      }
      // Calculate unlockables...
      this.locked = this.locked.filter(l => {
        if (l.cost.value <= counter.iCount) {
          this.unlockable.push(l); // create a interface element
          // remove it
          return false;
        }
        return true;
      });
    }
  }

  webevo.Prehistory = class extends webevo.Phase {

    constructor($element, model) {
      super($element, webevo.data.phases[0]);
      this.model = model;
      $('.visit', $element).click(() => {
        if(!this.model) { return; }
        this.model.addCount(this.model.visitors, 1);
      });
      const holder = $('.automation', this.$element);
      this.incrementors.push(new webevo.WOMOption(holder, this.model, {
        counter: this.model.visitors,
        name: 'Word of mouth',
        parent: holder
      }));
      this.incrementors.push(new webevo.WOMOption(holder, this.model, {
        counter: this.model.visitors,
        targetCounter: this.model.income,
        costBase: 100,
        rate: 0.1,
        name: 'Offer Web Design Services',
        parent: holder
      }));
    }

    notifyCounter(counter) {
      this.incrementors.forEach(i => i.notifyCounter(counter));
    }

  };

  webevo.Model = class {
    constructor() {
      // this.phases = [];
      this.phase = undefined;
      this.visitors = new webevo.Counter($('.visitors'), { name: 'visitors'});
      this.visitors.listeners.push(this);
      this.income = new webevo.Counter($('.income'), { name: 'income'});
      this.income.listeners.push(this);
      this.renown = 0;
      this.frame = new webevo.Frame(this);
      this.researchService = new webevo.ResearchService(this);
    }

    notifyCounter(counter) {
      if( this.phase) { this.phase.notifyCounter(counter); }
      if(counter === this.income) {
        this.researchService.notifyCounter(counter);
      }
    }

    addCount(counter, count = 1) {
      counter.add(count);
    }

    init(json) {
      this.phase = new webevo.Prehistory($('#phase'), this);
      if(json && json.phase) {
        this.phase.restore(json.phase);
      }
      this.phase.toggle(true);
    }

    restore() {
      const sData = localStorage.getItem('webevo');
      if(!sData) { this.init(); return; }
      const json = JSON.parse(sData);
      console.log(json);
      if(!json.phase) { this.init();  return; }
      this.init(json);
      this.visitors.restore(json.visitors);
      this.income.restore(json.income);
    }

    save() {
      return {
        phase : this.phase.save(),
        renown: this.renown,
        visitors : this.visitors.save(),
        income: this.income.save()
      }
    }

  };

})();
