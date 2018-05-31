/* jshint esversion: 6 */
(function() {
  const webevo = window.webevo;

  webevo.ResearchNode = class {
    get id() {
      return this.definition.id;
    }

    constructor(d) {
      this.definition = d;
      this.enables = [];
      this.requires = [];
      this.locked=  true;
    }

    unlock(model) {
      if(!this.locked) { return; }
      this.locked = false;
      const actions = this.definition.actions;
      if(actions) {
        if(actions.addClass) {
          model.phase.$element.addClass(actions.addClass);
        }
        if(actions.removeClass) {
          model.phase.$element.removeClass(actions.removeClass);
        }
        if(actions.title) {
          model.phase.title = actions.title;
        }
        if(actions.odometer) {
          model.visitors.odometer(actions.odometer);
          model.income.odometer(actions.odometer);
        }
        if(actions.footer) {
          model.phase.footer.render(actions.footer);
          $('#info').appendTo(model.phase.footer.$element);
        }
        if(actions.addIncome) {
          model.income.rate += actions.addIncome;
        }
        if(actions.gif) {
          if(actions.gif.title) {
            if(model.phase.$titleGif) model.phase.$titleGif.remove();
            model.phase.$titleGif = $('<img/>').attr('src', actions.gif.title).appendTo(  model.phase.$titleWrapper);
          }
          if(actions.gif.body) {
            if(model.phase.$bodyGif) model.phase.$bodyGif.remove();
            model.phase.$bodyGif = $('<img/>').attr('src', actions.gif.body)
            .appendTo(  model.phase.$body);
          }
        }
        if(actions.blink !== undefined) {
          if(actions.blink) {
            $('<blink/>').text(actions.blink).appendTo(model.phase.$body);
          } else {
            $('blink').remove();
          }
        }
        if(actions.addIcon) {
          $('<img/>').attr('src', actions.addIcon).appendTo(model.phase.$icons);
        }
      }
    }
  };

  webevo.ResearchService = class {
    constructor(model) {
      this.model = model;
      this.onUnlock = new Rx.Subject();

      this.unlocked = [];
      this.unlockable = [];
      this.locked = [];
      this.all = [];
      this.map = { };
      webevo.data.research.forEach(r => {
        const node = this.map[r.id] = new webevo.ResearchNode(r);
        this.all.push(node);
      });
      this.all.forEach(n => {
        if(!n.definition.requirements) {
          this.unlockable.push(n);
        } else {
          n.definition.requirements.forEach(req => {
            const other = this.map[req];
            if(!req) { throw new Error('No such research defined ' + req ); }
            other.enables.push(n);
            n.requires.push(other);
          });
        }
      });

     this.hidden = true;
    }

    save() {
      return {
        unlocked: this.unlocked.slice()
      };
    }

    restore(json) {
      if(!json) { return; }
      if (json.unlocked) {
        json.unlocked.forEach(u => this.unlock(u));
      }
    }

    unlock(id) {
      const i = this.unlockable.findIndex(u => u.id === id);
      if(i < 0) { return; }
      const node = this.unlockable[i];
      const emit = node.locked;
      node.unlock(this.model);
      this.unlockable.splice(i, 1);
      node.enables.forEach(other => {
        const hasLocked = other.requires.find(u => u.locked);
        if(!hasLocked) {
          this.unlockable.push(other);
        }
      });
      if(emit) {
        this.unlocked.push(node.id);
        this.onUnlock.onNext(node);
        // NOTIFY progress
      }
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
  };

  webevo.ResearchPanel = class {
    constructor(node, model, $parent) {
      this.node = node;
      this.model = model;
      this.$parent = $parent;
      const title = node.definition.name ? node.definition.name : node.id;
      $('<div class="title"></div>').text(title).appendTo($parent);
      if(node.definition.description){
        $('<div class="description"></div>').text(node.definition.description).appendTo($parent);
      }
      const $costNode = $('<div class="cost"/>').appendTo($parent);
      const costString = node.definition.cost.value + ' ' + node.definition.cost.type;
      $('<span>Cost:<span>').appendTo($costNode);
      $('<span><span>').text(costString).appendTo($costNode);
      this.$button = $('<button>+</button>').appendTo($costNode).click(() => {
        this.unlock();
      });
    }

    unlock() {
      if (this.model.removeCount(this.model.income, this.node.definition.cost.value)) {
        // console.log(this.model.income, this.node.definition.cost.value);
        this.model.researchService.unlock(this.node.id);
      }
    }
  };

  webevo.Prehistory = class extends webevo.Phase {

    constructor($element, model) {
      super($element, webevo.data.phases[0]);
      this.model = model;
      $('.visit', $element).click(() => {
        if(!this.model) { return; }
        this.model.addCount(this.model.visitors, 1);
      });

      const holder = this.$automation = $('.automation', this.$element);
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
      const research = this.$research = $('<ul/>').appendTo($('.research'));
      this.updateResearch();
    }

    updateResearch() {
      this.$research.empty();
      this.model.researchService.unlockable.forEach((n) => {
        new webevo.ResearchPanel(n, this.model, $('<li class="research-panel"/>').appendTo(this.$research));
      });
    }

    unlockedResearch(r) {
      if(!r) { return; }
      this.updateResearch();
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
      this.income = new webevo.Counter($('.income'), { name: 'income', round: 1});
      this.income.listeners.push(this);
      this.renown = 0;
      this.frame = new webevo.Frame(this);
      this.researchService = new webevo.ResearchService(this);
      this.researchService.onUnlock.subscribe((r) => {
        this.unlockedResearch(r);
      });
    }

    reset() {
      localStorage.removeItem('webevo');
      location.reload();
    }

    unlockedResearch(r) {
        if( this.phase) { this.phase.unlockedResearch(r); }
    }

    notifyCounter(counter) {
      if( this.phase) { this.phase.notifyCounter(counter); }
      if(counter === this.income) {
        this.researchService.notifyCounter(counter);
      }
    }

    addCount(counter, count = 1) {
      if(!count || !counter) { return; }
      if(count < 0){
        return this.removeCount(counter, count);
      }
      counter.add(count);
    }

    removeCount(counter, count = 1) {
      if(!count || !counter) { return; }
      return counter.remove(count);
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
      try {
        const json = JSON.parse(sData);
        console.log(json);
        if(!json.phase) { this.init();  return; }
        this.init(json);
        this.visitors.restore(json.visitors);
        this.income.restore(json.income);
        this.researchService.restore(json.research);
      } catch(e ) {
        console.error(e);
      }

    }

    save() {
      return {
        phase : this.phase.save(),
        renown: this.renown,
        visitors : this.visitors.save(),
        income: this.income.save(),
        research : this.researchService.save()
      };
    }

  };

})();
