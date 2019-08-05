import Vue from 'vue';

// noinspection ES6ModulesDependencies
export const FFInputTag = ({ data }) => (
  <span class="input-tag-content">
    <span domProps={{ innerHTML: data.attrs.opts.label }}/>
    <a href="#" role="button" tabindex="-1" class="text-secondary" on={{
      'click': (evt) => {
        evt.preventDefault(); evt.stopPropagation();
        if ('function' === typeof data.attrs.opts.remove) {
          data.attrs.opts.remove();
        }
      },
      'mousedown': (evt) => {
        evt.preventDefault(); evt.stopPropagation();
      },
    }}>
      <FontAwesomeIcon icon='times' fixedWidth/>
    </a>
  </span>
);

// noinspection ES6ModulesDependencies
export const FFListDivider = ({ data, slots }) => (
  <BListGroupItem {...{
    ...data,
    ...{
      attrs: {},
    },
  }} class="list-group-item-divider">
    {data.attrs.opts.icon ? <FontAwesomeIcon icon={data.attrs.opts.icon} fixedWidth/> : ''}
    {'string' === typeof data.attrs.opts.label
      ? <span domProps={{ innerHTML: data.attrs.opts.label }}/>
      : 'function' === typeof data.attrs.opts.label
        ? <span domProps={{ innerHTML: data.attrs.opts.label() }}/>
        : <span><em class="text-danger">{'{Error: Missing Label}'}</em></span>}
    {slots().default}
  </BListGroupItem>
);

// noinspection ES6ModulesDependencies
export const FFListItem = ({ data, slots }) => (
  <BListGroupItem {...{
    ...data,
    ...{
      attrs: { id: data.attrs.id },
      class: {
        ...data.class,
        selected: data.attrs.selected,
      },
    },
  }} href="#" role="button" tabindex="-1">
    <FontAwesomeIcon icon='caret-right' fixedWidth/>
    {data.attrs.opts.icon ? <FontAwesomeIcon icon={data.attrs.opts.icon} fixedWidth/> : ''}
    {'string' === typeof data.attrs.opts.label
      ? <span domProps={{ innerHTML: data.attrs.opts.label }}/>
      : 'function' === typeof data.attrs.opts.label
        ? <span domProps={{ innerHTML: data.attrs.opts.label() }}/>
        : <span><em class="text-danger">{'{Error: Missing Label}'}</em></span>}
    {slots().default}
  </BListGroupItem>
);

FFInputTag.factory = ({ label, remove, ...params }) => ({ opts: { label, remove, params }, component: FFInputTag });
FFListDivider.factory = ({ label, icon }) => ({ opts: { label, icon, skip: true }, component: FFListDivider });
FFListItem.factory = ({ label, icon, enter, ...params }) => ({ opts: { label, icon, enter, params }, component: FFListItem });

export class FFProcessor {
  constructor (parent, props = {}) {
    this.parent = parent;
    this.props = props;
    this.search = '';
    this.ui = Vue.observable({
      active: false,
      actions: [],
      suggestions: [],
      tags: [],
    });
  }
  initialize (vm) {
    this.vm = vm;
    return this;
  }
  activate () {
    this.ui.active = true;
    return this;
  }
  deactivate () {
    this.ui.active = false;
    return this;
  }
  updateCache () {
    return this;
  }
  updateSource () {
    return this;
  }
  updateUserInput () {
    return this;
  }
}

export class FFCountryFilter extends FFProcessor {
  constructor (parent, props) {
    super(parent, props);
    this.ui.actions.push(
      FFListItem.factory({ label: 'Browse countries...', icon: 'globe-africa', enter: () => this.activate() }),
      //FFListItem.factory({ label: 'Browse proxies...', icon: 'microscope', enter: () => this.activate() }),
      //FFListItem.factory({ label: 'Search citations...', icon: 'quote-right', enter: () => this.activate() }),
    );
    this.inputDelay = undefined;
    this.localMemory = [];
    this.previousSelection = -1;
    this.searchTokens = [];
    this.suggestionsTitle = FFListDivider.factory({ label: 'Available filters', icon: 'filter' });
    this.suggestionsBack = FFListItem.factory({ label: 'Go back...', enter: () => this.deactivate() });
    this.suggestions = [];
  }
  initialize (vm) {
    super.initialize(vm);
    return this;
  }
  activate () {
    super.activate();
    this.searchTokens = [];
    this.vm.userInput = '';
    this.refreshSuggestions();
    this.previousSelection = this.vm.state.selected;
    this.vm.state.selected = 1;
    return this;
  }
  deactivate () {
    super.deactivate();
    this.vm.userInput = '';
    this.ui.suggestions.splice(0, this.ui.suggestions.length);
    this.vm.state.selected = this.previousSelection;
    return this;
  }
  refreshCache () {
    let cache = { ...this.vm.cache };
    let condition = this.ui.tags.map(tag => tag.opts.params.value);
    let hiddenBefore = this.localMemory;
    let hiddenNow = this.vm.source.filter(
      lake => !lake.countries.some(country => !condition.length || condition.includes(country)),
    );
    hiddenBefore.filter(lake => !hiddenNow.includes(lake)).forEach(({ uuid }) => --cache[uuid] || (cache[uuid] = 0));
    hiddenNow.filter(lake => !hiddenBefore.includes(lake)).forEach(({ uuid }) => ++cache[uuid] || (cache[uuid] = 1));
    this.localMemory = hiddenNow;
    this.vm.cache = cache;
    return this;
  }
  refreshSuggestions () {
    if (!this.ui.active) return this;
    this.ui.suggestions = [
      this.suggestionsTitle,
      this.suggestionsBack,
      ...this.suggestions.filter(
        s => !this.ui.tags.find(t => t.opts.params && s.opts.params && t.opts.params.value === s.opts.params.value),
      ).filter(s => !this.searchTokens.length || this.searchTokens.some(t => s.opts.label.indexOf(t) > -1)),
    ];
    if (this.vm.state.selected >= this.vm.dropdown.length - 1) {
      this.vm.state.selected = this.vm.dropdown.length - 1;
    }
    return this;
  }
  updateCache () {
    super.updateCache();
    return this;
  }
  updateSource () {
    super.updateSource();
    this.suggestions = [...new Set([].concat(...this.vm.source.map(lake => lake.countries)))]
      .sort(({ name: a }, { name: b }) => a.toLowerCase() < b.toLowerCase() ? -1 : 1)
      .map(country => FFListItem.factory({
        label: `Add filter for <strong>${country.name}</strong>`,
        icon: 'globe-africa',
        value: country,
        enter: () => {
          let thisTag = FFInputTag.factory({ label: country.name, value: country });
          thisTag.opts.remove = () => {
            this.ui.tags.splice(this.ui.tags.findIndex(t => t === thisTag), 1);
            this.refreshSuggestions();
            this.refreshCache();
          };
          this.ui.tags.push(thisTag);
          if (this.vm.userInput !== '') {
            this.vm.userInput = '';
          } else {
            this.refreshSuggestions();
          }
          this.refreshCache();
        },
      }));
    this.refreshSuggestions();
    return this;
  }
  updateUserInput () {
    super.updateUserInput();
    if (!this.ui.active) return this;
    this.searchTokens = this.vm.userInput.trim().split(' ').filter(s => !!s);
    console.log('User input:', this.searchTokens);
    clearTimeout(this.inputDelay);
    this.inputDelay = setTimeout(() => this.refreshSuggestions(), 250);
    return this;
  }
  static factory (parent, props) {
    return new FFCountryFilter(parent, props);
  }
}
