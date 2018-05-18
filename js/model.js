/* jshint esversion: 6 */
(function() {
  const webevo = window.webevo;

  webevo.Prehistory = class extends webevo.Phase {

    constructor($element) {
      super($element, {
        id: 'prehistoric',
        title: 'The start of it all',
        footer: {
          text: 'This is your footer. You haven\'t figured out what to write here yet.'
        }
      });
      $('.visit', $element).click(() => {
        if(!this.model) { return; }
        this.model.addVisitor();
      });

    }

    notifyVisitors(count) {
      if(!this.wordOfMouth && count >= 10) {
        const holder = $('.automation', this.$element).show();
        this.wordOfMouth = new webevo.WOMOption(holder, this.model, {
          name: 'Word of mouth'
        });
        this.incrementors.push(this.wordOfMouth);
      }
    }

  };

  webevo.HreyPhase = class extends webevo.Phase {
    constructor($element) {
      super($element);
    }
  };

  webevo.JustNoPhase = class extends webevo.Phase {
    constructor($element) {
      super($element);
    }
  };

  webevo.FuglyEraPhase = class extends webevo.Phase {
    constructor($element) {
      super($element);
    }
  };

  webevo.TableGalorePhase = class extends webevo.Phase {
    constructor($element) {
      super($element);
    }
  };

  webevo.Model = class {
    constructor() {
      this.phases = [];
      this.phase = undefined;
      this.visitors = new webevo.Visitors();
      this.renown = 0;
      this.frame = new webevo.Frame(this);
    }

    addVisitor(count = 1) {
      const oldVal = this.visitors.iCount;
      this.visitors.add(count);
      if(oldVal !== this.visitors.iCount) {
        if( this.phase) { this.phase.notifyVisitors(this.visitors.count); }

      }
    }

    restore(json) {
      if(!json) return;
      const phaseId = json.phase.id;
      if('prehistoric' === phaseId) {
        this.phase = new Prehistory($('#phase'));
        this.phase.model = this;
        this.phase.restore(json.phase);
        this.phase.toggle(true);
      }
      this.visitors.restore(json.visitors);
    }

    save() {
      return {
        phase : this.phase.save(),
        renown: this.renown,
        visitors : this.visitors.save()
      }
    }

    addPhase(phase) {
      this.phases.push(phase);
      phase.model  = this;
      const currentPhase = this.phases.length === 1;
      phase.toggle(currentPhase);
      if (currentPhase) { this.phase = phase; }
    }

  };

})();
