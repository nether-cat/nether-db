import Vue from 'vue';

// noinspection ES6ModulesDependencies
export const FFInputTag = ({ data }) => (
  <span class={{ 'input-tag-content': true, 'invalid': !data.attrs.opts.valid }}>
    {data.attrs.opts.icon ? <FontAwesomeIcon icon={data.attrs.opts.icon} class="mr-1"/> : ''}
    <span domProps={{ innerHTML: data.attrs.opts.label }}/>
    <a href="#" role="button" tabindex="-1" class="ml-1" on={{
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
      <FontAwesomeIcon icon="times"/>
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
    <span style={{ float: 'right ' }}><kbd data-key="up">&#8593;</kbd><kbd data-key="down">&#8595;</kbd></span>
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
        escape: data.attrs.opts.params.escape,
      },
    },
  }} href="#" role="button" tabindex="-1">
    <FontAwesomeIcon
      icon="caret-right"
      fixedWidth
      {...(data.attrs.opts.params.flipCaret ? {
        props: { flip: 'horizontal' },
      } : {})}
    />
    {data.attrs.opts.icon ? <FontAwesomeIcon
      icon={data.attrs.opts.icon}
      fixedWidth
      {...(data.attrs.opts.params.flipIcon ? {
        props: { flip: 'horizontal' },
      } : {})}
    /> : ''}
    {'string' === typeof data.attrs.opts.label
      ? <span domProps={{ innerHTML: data.attrs.opts.label }}/>
      : 'function' === typeof data.attrs.opts.label
        ? <span domProps={{ innerHTML: data.attrs.opts.label() }}/>
        : <span><em class="text-danger">{'{Error: Missing Label}'}</em></span>}
    {slots().default}
    <span style={{ float: 'right' }}>
      <kbd data-key="escape"><small>esc</small></kbd>
      <kbd data-key="enter">&#8629;</kbd>
    </span>
  </BListGroupItem>
);

FFInputTag.factory = ({ label, icon, remove, ...params }) => (
  { opts: { label, icon, remove, valid: true, params }, component: FFInputTag, t: Date.now() }
);
FFListDivider.factory = ({ label, icon }) => (
  { opts: { label, icon, skip: true }, component: FFListDivider }
);
FFListItem.factory = ({ label, icon, enter, ...params }) => (
  { opts: { label, icon, enter, params }, component: FFListItem }
);

export class FFProcessor {
  static factory (parent, props) {
    return new this(parent, props);
  }
  constructor (parent, props = {}) {
    this.vm = undefined;
    this.name = undefined;
    this.parent = parent;
    this.props = props;
    this.knownCache = {};
    this.localCache = {};
    this.localMemory = [];
    this.hiddenRule = function () {
      return false;
    };
    this.ui = Vue.observable({
      active: false,
      actions: [],
      data: [],
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
  refreshCache () {
    let cache = { ...this.vm.cache };
    let predicate = this.ui.tags.map(tag => tag.opts.params.value);
    let hiddenBefore = this.localMemory;
    let hiddenNow = this.vm.source.filter(this.hiddenRule, predicate);
    hiddenBefore.filter(lake => !hiddenNow.includes(lake)).forEach(({ uuid }) => {
      --cache[uuid] || (cache[uuid] = 0);
      delete this.localCache[uuid];
    });
    hiddenNow.filter(lake => !hiddenBefore.includes(lake)).forEach(({ uuid }) => {
      ++cache[uuid] || (cache[uuid] = 1);
      this.localCache[uuid] = 1;
    });
    this.localMemory = hiddenNow;
    this.knownCache = cache;
    this.vm.cache = cache;
    return this;
  }
  updateCache () {
    return this;
  }
  updateSource () {
    return this;
  }
  updateTextInput () {
    return this;
  }
}

export class FFDomainFilter extends FFProcessor {
  initialize (vm) {
    super.initialize(vm);
    this.name = 'domain';
    this.hiddenRule = function (lake) {
      let datasets = [...new Set([].concat(...lake.cores.map(core => core.datasets)))];
      return this.length && this.every(([lowerLimit, upperLimit]) => !datasets.some(
        ({ ageMin, ageMax }) => (ageMin > lowerLimit && ageMin < upperLimit
          || ageMax > lowerLimit && ageMax < upperLimit),
      ));
    };
    return this;
  }
  updateCache () {
    if (this.vm.cache !== this.knownCache) {
      let cacheDiff = { ...this.vm.cache };
      Object.keys(this.localCache).forEach(uuid => --cacheDiff[uuid]);
      let datasets = [...new Set([].concat(...this.vm.source.filter(lake => !cacheDiff[lake.uuid]).map(
        lake => [...new Set([].concat(...lake.cores.map(core => core.datasets)))],
      )))].filter(
        d => !Number.isNaN(Number.parseFloat(d.ageMin)) && !Number.isNaN(Number.parseFloat(d.ageMax)),
      );
      let [{ ageMin } = {}] = datasets.sort((dLeft, dRight) => dLeft.ageMin - dRight.ageMin);
      let [{ ageMax } = {}] = datasets.sort((dLeft, dRight) => dRight.ageMax - dLeft.ageMax);
      this.ui.data = { ageMin, ageMax };
      this.ui.tags.forEach(t => {
        let [lowerLimit, upperLimit] = t.opts.params.value;
        t.opts.valid = datasets.some(
          ({ ageMin, ageMax }) => (ageMin > lowerLimit && ageMin < upperLimit
            || ageMax > lowerLimit && ageMax < upperLimit),
        );
      });
    }
    return this;
  }
  updateSource () {
    this.ui.data = [].concat(...this.vm.source);
    let datasets = [...new Set([].concat(...this.vm.source).map(
      lake => [...new Set([].concat(...lake.cores.map(core => core.datasets)))],
    ))].filter(
      d => !Number.isNaN(Number.parseFloat(d.ageMin)) && !Number.isNaN(Number.parseFloat(d.ageMax)),
    );
    let [{ ageMin } = {}] = datasets.sort((dLeft, dRight) => dLeft.ageMin - dRight.ageMin);
    let [{ ageMax } = {}] = datasets.sort((dLeft, dRight) => dRight.ageMax - dLeft.ageMax);
    this.ui.data = { ageMin, ageMax };
    return this;
  }
}

export class FFEventFilter extends FFProcessor {
  initialize (vm) {
    super.initialize(vm);
    this.name = 'events';
    this.hiddenRule = function (lake) {
      return this.length && this.every(event => !event.lakes.find(l => l.uuid === lake.uuid));
    };
    return this;
  }
  updateCache () {
    if (this.vm.cache !== this.knownCache) {
      let cacheDiff = { ...this.vm.cache };
      Object.keys(this.localCache).forEach(uuid => --cacheDiff[uuid]);
      this.ui.data = [].concat(...this.vm.source.filter(lake => !cacheDiff[lake.uuid]));
      this.ui.tags.forEach(t => (
        t.opts.valid = t.opts.params.value.lakes.some(l => this.ui.data.find(d => l.uuid === d.uuid))
      ));
    }
    return this;
  }
  updateSource () {
    this.ui.data = [].concat(...this.vm.source);
    return this;
  }
}

export class FFInteractiveFilter extends FFProcessor {
  constructor (parent, props) {
    super(parent, props);
    this.inputDelay = undefined;
    this.previousSelection = -1;
    this.searchTokens = [];
    this.suggestionsActive = [];
    this.suggestions = [];
    this.suggestionValues = [];
  }
  activate () {
    this.vm.state.textInput = '';
    this.vm.$nextTick(() => {
      super.activate();
      this.searchTokens = [];
      this.refreshSuggestions();
      this.previousSelection = this.vm.state.selected;
      this.vm.state.selected = -1;
      this.vm.moveSelection();
    });
    return this;
  }
  deactivate () {
    super.deactivate();
    this.ui.suggestions.splice(0, this.ui.suggestions.length);
    this.vm.$nextTick(() => {
      this.vm.state.textInput = '';
      this.vm.state.selected = this.previousSelection;
    });
    return this;
  }
  refreshSuggestions (selectFirstMatch = false) {
    if (!this.ui.active) return this;
    this.ui.suggestions = [
      ...this.suggestionsActive,
      ...this.suggestions.filter(
        s => !this.ui.tags.find(t => t.opts.params && s.opts.params && t.opts.params.value === s.opts.params.value),
      ).filter(
        s => this.suggestionValues.includes(s.opts.params.value),
      ).filter(
        s => !this.searchTokens.length || this.searchTokens.some(
          t => {
            let result;
            try {
              result = !!s.opts.label.match(RegExp(`(^|[^\\w])${t}`, 'i'));
            } catch (e) {
              result = false;
            }
            return result;
          },
        ),
      ),
    ];
    if (selectFirstMatch) {
      this.vm.state.selected = this.suggestionsActive.length;
    }
    if (this.vm.state.selected >= this.vm.dropdown.length - 1) {
      this.vm.state.selected = this.vm.dropdown.length - 1;
    }
    return this;
  }
  updateTextInput () {
    super.updateTextInput();
    if (!this.ui.active) return this;
    this.searchTokens = this.vm.state.textInput.trim().split(' ').filter(s => !!s);
    clearTimeout(this.inputDelay);
    this.inputDelay = setTimeout(() => this.refreshSuggestions(true), 250);
    return this;
  }
}

export class FFContinentFilter extends FFInteractiveFilter {
  initialize (vm) {
    super.initialize(vm);
    this.name = 'continents';
    this.hiddenRule = function (lake) {
      return ![...new Set([].concat(...lake.countries.map(country => country.continents)))]
        .some(continent => !this.length || this.includes(continent));
    };
    this.ui.actions.push(
      FFListItem.factory({ label: 'Search continents...', icon: 'compass', enter: () => this.activate() }),
    );
    this.suggestionsActive.push(
      FFListDivider.factory({ label: 'Available filters', icon: 'filter' }),
      FFListItem.factory({
        label: 'Go back...',
        icon: 'directions',
        enter: () => this.deactivate(),
        flipCaret: true,
        flipIcon: true,
      }),
    );
    return this;
  }
  updateCache () {
    if (this.vm.cache !== this.knownCache) {
      let cacheDiff = { ...this.vm.cache };
      Object.keys(this.localCache).forEach(uuid => --cacheDiff[uuid]);
      this.suggestionValues = [...new Set([].concat(...this.vm.source.filter(lake => !cacheDiff[lake.uuid]).map(
        lake => [...new Set([].concat(...lake.countries.map(country => country.continents)))],
      )))];
      this.ui.tags.forEach(t => (
        t.opts.valid = this.suggestionValues.includes(t.opts.params.value)
      ));
      this.refreshSuggestions();
    }
    return this;
  }
  updateSource () {
    const globes = {
      AF: 'globe-africa',
      AN: 'globe',
      AS: 'globe-asia',
      EU: 'globe-europe',
      NA: 'globe-americas',
      OC: 'globe-asia',
      SA: 'globe-americas',
    };
    this.suggestionValues = [...new Set([].concat(...this.vm.source.map(
      lake => [...new Set([].concat(...lake.countries.map(country => country.continents)))],
    )))];
    this.suggestions = this.suggestionValues
      .sort(({ name: a }, { name: b }) => a.toLowerCase() < b.toLowerCase() ? -1 : 1)
      .map(continent => FFListItem.factory({
        label: `Add filter for <strong>${continent.name}</strong>`,
        icon: globes[continent.code],
        value: continent,
        enter: () => {
          let thisTag = FFInputTag.factory({ label: continent.name, icon: globes[continent.code], value: continent });
          thisTag.opts.remove = () => {
            this.ui.tags.splice(this.ui.tags.findIndex(t => t === thisTag), 1);
            this.refreshSuggestions();
            this.refreshCache();
          };
          this.ui.tags.push(thisTag);
          if (this.vm.state.textInput !== '') {
            this.vm.state.textInput = '';
          } else {
            this.refreshSuggestions();
          }
          this.refreshCache();
          this.deactivate();
          this.vm.activateProcessor('countries');
        },
      }));
    this.refreshSuggestions();
    return this;
  }
}

export class FFCountryFilter extends FFInteractiveFilter {
  initialize (vm) {
    super.initialize(vm);
    this.name = 'countries';
    this.hiddenRule = function (lake) {
      return !lake.countries.some(country => !this.length || this.includes(country));
    };
    this.ui.actions.push(
      FFListItem.factory({ label: 'Search countries...', icon: 'map-marker-alt', enter: () => this.activate() }),
    );
    this.suggestionsActive.push(
      FFListDivider.factory({ label: 'Available filters', icon: 'filter' }),
      FFListItem.factory({
        label: 'Go back...',
        icon: 'directions',
        enter: () => this.deactivate(),
        flipCaret: true,
        flipIcon: true,
      }),
    );
    return this;
  }
  updateCache () {
    if (this.vm.cache !== this.knownCache) {
      let cacheDiff = { ...this.vm.cache };
      Object.keys(this.localCache).forEach(uuid => --cacheDiff[uuid]);
      this.suggestionValues = [...new Set([].concat(
        ...this.vm.source.filter(lake => !cacheDiff[lake.uuid]).map(lake => lake.countries),
      ))];
      this.ui.tags.forEach(t => (
        t.opts.valid = this.suggestionValues.includes(t.opts.params.value)
      ));
      this.refreshSuggestions();
    }
    return this;
  }
  updateSource () {
    this.suggestionValues = [...new Set([].concat(...this.vm.source.map(lake => lake.countries)))];
    this.suggestions = this.suggestionValues
      .sort(({ name: a }, { name: b }) => a.toLowerCase() < b.toLowerCase() ? -1 : 1)
      .map(country => FFListItem.factory({
        label: `Add filter for <strong>${country.name}</strong>`,
        icon: 'map-marker-alt',
        value: country,
        enter: () => {
          let thisTag = FFInputTag.factory({ label: country.name, icon: 'map-marker-alt', value: country });
          thisTag.opts.remove = () => {
            this.ui.tags.splice(this.ui.tags.findIndex(t => t === thisTag), 1);
            this.refreshSuggestions();
            this.refreshCache();
          };
          this.ui.tags.push(thisTag);
          if (this.vm.state.textInput !== '') {
            this.vm.state.textInput = '';
          } else {
            this.refreshSuggestions();
          }
          this.refreshCache();
        },
      }));
    this.refreshSuggestions();
    return this;
  }
}

export class FFLakeFilter extends FFInteractiveFilter {
  initialize (vm) {
    super.initialize(vm);
    this.name = 'lakes';
    this.hiddenRule = function (lake) {
      return this.length && !this.includes(lake);
    };
    this.ui.actions.push(
      FFListItem.factory({ label: 'Search lakes...', icon: 'map-pin', enter: () => this.activate() }),
    );
    this.suggestionsActive.push(
      FFListDivider.factory({ label: 'Available filters', icon: 'filter' }),
      FFListItem.factory({
        label: 'Go back...',
        icon: 'directions',
        enter: () => this.deactivate(),
        flipCaret: true,
        flipIcon: true,
      }),
    );
    return this;
  }
  updateCache () {
    if (this.vm.cache !== this.knownCache) {
      let cacheDiff = { ...this.vm.cache };
      Object.keys(this.localCache).forEach(uuid => --cacheDiff[uuid]);
      this.suggestionValues = [...new Set([].concat(
        ...this.vm.source.filter(lake => !cacheDiff[lake.uuid]),
      ))];
      this.ui.tags.forEach(t => (
        t.opts.valid = this.suggestionValues.includes(t.opts.params.value)
      ));
      this.refreshSuggestions();
    }
    return this;
  }
  updateSource () {
    this.suggestionValues = [...new Set([].concat(...this.vm.source))];
    this.suggestions = this.suggestionValues
      .sort(({ name: a }, { name: b }) => a.toLowerCase() < b.toLowerCase() ? -1 : 1)
      .map(lake => FFListItem.factory({
        label: `Add filter for <strong>${lake.name}</strong> (${lake.countries.map($ => $.code).join(', ')})`,
        icon: 'map-pin',
        value: lake,
        enter: () => {
          let thisTag = FFInputTag.factory({ label: lake.name, icon: 'map-pin', value: lake });
          thisTag.opts.remove = () => {
            this.ui.tags.splice(this.ui.tags.findIndex(t => t === thisTag), 1);
            this.refreshSuggestions();
            this.refreshCache();
          };
          this.ui.tags.push(thisTag);
          if (this.vm.state.textInput !== '') {
            this.vm.state.textInput = '';
          } else {
            this.refreshSuggestions();
          }
          this.refreshCache();
        },
      }));
    this.refreshSuggestions();
    return this;
  }
}
