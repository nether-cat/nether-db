<template>
  <div
    :class="{
      'form-group': true,
      'focus-explicit': true,
      'focus-within': state.focused,
      'is-filled': !!state.textInput.trim() || tags.length,
    }"
  >
    <label for="inputTextSearch" class="d-block">
      <FontAwesomeIcon icon="search" fixed-width/> Filters to be used
    </label>
    <div>
      <div
        class="form-control"
        @focusin="setFocus(true)"
        @focusout="setFocus(false)"
        @mousedown.prevent.stop="focusElement('inputTextSearch')"
      >
        <div class="input-textarea-wrapper">
          <textarea
            id="inputTextSearch"
            v-model="state.textInput"
            :style="styleProps"
            @keydown.down.prevent="moveSelection('forward')"
            @keydown.up.prevent="moveSelection('backward')"
            @keydown.esc.prevent="focusElement('escapeHandler')"
            @keydown.enter.prevent="enterSelection()"
            @keydown.exact="onKeyDown"
            @mousedown.stop
          />
        </div>
        <TransitionGroup
          class="input-tags-wrapper"
          name="input-tags"
          tag="span"
          @enter="$nextTick(() => updateExtents())"
          @after-leave="$nextTick(() => updateExtents())"
          @mousedown.prevent.stop="focusElement('inputTextSearch')"
        >
          <span
            v-for="(item, index) in tags"
            :key="item.opts.label ? `${item.opts.label}` : `${index}`"
            class="input-tag"
            @mousedown.prevent.stop
          >
            <Component
              :is="item.component"
              :id="'filtersInputTag' + index"
              :index="index"
              :opts="item.opts"
            />
          </span>
        </TransitionGroup>
        <span id="inputTextExtent" class="input-textarea-extent">
          <span v-if="!state.textInput.trim()">&nbsp;</span>
          {{ state.textInput }}
        </span>
        <div class="form-footer">
          <BListGroup v-if="state.focused && dropdown.length">
            <Component
              :is="item.component"
              v-for="(item, index) in dropdown"
              :id="'filtersListItem' + index"
              :key="item.opts.label ? `${item.opts.label}` : `${index}`"
              :index="index"
              :opts="item.opts"
              :selected="index === state.selected"
              @click="item.opts.enter && item.opts.enter(item.opts)"
              @mousedown.prevent.stop
              @mouseenter.passive="!state.ignoreMouse && setSelection(index)"
              @mousemove.passive="!state.ignoreMouse && setSelection(index)"
              @mouseleave.passive="!state.ignoreMouse && setSelection(-1)"
            />
          </BListGroup>
        </div>
      </div>
      <a
        id="escapeHandler"
        href="#"
        role="button"
        tabindex="-1"
        @focusin.stop
        @click.prevent.stop="focusElement('inputTextSearch')"
      />
    </div>
  </div>
</template>

<script>
import { FFListDivider, FFListItem } from '@/components/FormFiltersLibrary';

export default {
  name: 'FormFilters',
  props: {
    scope: {
      type: String,
      default: 'ViewDatabaseIndex',
    },
    source: {
      type: Array,
      default: () => [],
    },
    use: {
      type: Array,
      default: () => [],
    },
    result: {
      type: Array,
      default: () => [],
    },
  },
  data () {
    return {
      state: {
        focused: false,
        focusTimer: undefined,
        ignoreMouse: false,
        selected: -1,
        selectTimer: undefined,
        textInput: '',
      },
      cache: {},
      styleProps: {
        height: '28px',
        textIndent: 0,
        top: '16px',
      },
      processors: this.use.map(proc => proc.initialize(this)),
      actionsBefore: [
        FFListDivider.factory({
          label: 'Featured actions',
          icon: ['far', 'hand-point-right'],
        }),
      ],
      actionsAfter: [
        FFListItem.factory({
          label: 'Close this dialog...',
          icon: 'comment-slash',
          enter: () => this.focusElement('escapeHandler'),
          flipCaret: true,
        }),
      ],
    };
  },
  computed: {
    mutatedItems () {
      return this.items;
    },
    allActions () {
      let actions = [].concat(...this.processors.map(proc => proc.ui.actions));
      let allActions = [...this.actionsBefore, ...actions, ...this.actionsAfter];
      return (allActions.length > 1 ? allActions : []);
    },
    allSuggestions () {
      return [].concat(...this.processors.map(proc => proc.ui.suggestions));
    },
    dropdown () {
      if (this.processors.every(proc => !proc.ui.active)) {
        return this.allActions;
      } else {
        return this.allSuggestions;
      }
    },
    tags () {
      return [].concat(...this.processors.map(proc => proc.ui.tags))
        .sort((tagLeft, tagRight) => tagLeft.t - tagRight.t);
    },
  },
  watch: {
    // TODO: Debounce these watchers to improve performance
    cache: {
      handler () {
        this.processors.forEach(proc => proc.updateCache());
        this.updateResult();
      },
      deep: true,
    },
    source: {
      handler () {
        this.processors.forEach(proc => proc.updateSource());
        this.updateResult();
      },
      immediate: true,
    },
    'state.textInput': {
      handler (newVal, oldVal) {
        let sanitized = newVal.trim().replace(/\s+/g, ' ');
        if (sanitized !== oldVal.trim().replace(/\s+/g, ' ')) {
          if (newVal.match(/\w\s+$/)) {
            sanitized += ' ';
          }
          if (sanitized !== newVal) {
            this.state.textInput = sanitized;
          } else {
            this.$nextTick(() => this.updateExtents());
          }
          this.processors.forEach(proc => proc.updateTextInput());
        } else {
          this.$nextTick(() => this.updateExtents());
        }
      },
    },
  },
  mounted () {
    console.log('[APP] Filter processors used:', this.processors);
  },
  methods: {
    updateResult () {
      this.$emit('update:result', this.source.filter(it => !this.cache[it.uuid]));
    },
    focusElement (id) {
      (id && document && document.getElementById(id).focus());
    },
    setFocus (focused) {
      clearTimeout(this.state.focusTimer);
      this.state.focusTimer = setTimeout(() => {
        this.state.focused = focused;
        if (!focused) {
          this.processors
            .filter(proc => proc.ui.active)
            .forEach(proc => proc.deactivate());
          if (!!this.state.textInput && !this.state.textInput.trim()) {
            this.state.textInput = '';
          }
        } else {
          this.state.selected = -1;
          this.moveSelection();
        }
      }, !focused ? 20 : 0);
    },
    setSelection (index) {
      clearTimeout(this.state.selectTimer);
      this.state.selectTimer = setTimeout(() => {
        this.state.selected = index;
      }, index < 0 ? 20 : 0);
    },
    enterSelection () {
      let item = this.dropdown[this.state.selected];
      if (item && item.opts.enter) {
        this.state.ignoreMouse = true;
        setTimeout(() => this.state.ignoreMouse = false, 60);
        item.opts.enter(item.opts);
      }
    },
    moveSelection (direction = 'forward') {
      let backward = ('forward' !== direction);
      let cursor = backward ? --this.state.selected : ++this.state.selected;
      if (cursor >= this.dropdown.length) {
        cursor = (this.state.selected = 0);
      } else if (cursor < 0) {
        cursor = (this.state.selected = this.dropdown.length - 1);
      }
      if (this.dropdown[cursor].opts.skip) {
        this.moveSelection(direction);
      } else {
        this.state.ignoreMouse = true;
        setTimeout(() => this.state.ignoreMouse = false, 60);
        let el = document.getElementById('filtersListItem' + cursor);
        if (el) {
          if (el.offsetTop < (el.parentNode.scrollTop + (el.offsetHeight - 1))) {
            el.parentNode.scrollTop = el.offsetTop - (el.offsetHeight - 1);
          } else if (el.offsetTop > (el.parentNode.scrollTop + el.parentNode.clientHeight - 2 * (el.offsetHeight - 1))) {
            let m = (el === el.parentNode.children[el.parentNode.children.length - 1]) ? 1 : 2;
            el.parentNode.scrollTop = el.offsetTop - el.parentNode.clientHeight + m * (el.offsetHeight - 1) - 1;
          }
        }
      }
    },
    activateProcessor (name = '') {
      let proc = this.processors.find(proc => name === proc.name);
      if (proc) {
        proc.activate();
      }
    },
    updateExtents () {
      let extentElem = document.getElementById('inputTextExtent');
      let searchElem = document.getElementById('inputTextSearch');
      if (!extentElem || !searchElem) {
        return;
      }
      let { height, top } = this.styleProps;
      let { offsetHeight, offsetLeft, offsetTop } = extentElem;
      offsetLeft = offsetLeft - 9 > 5 ? offsetLeft - 9 : 0;
      this.styleProps.height = `${offsetHeight + 9}px`;
      this.styleProps.textIndent = offsetLeft ? `${offsetLeft}px` : 0;
      this.styleProps.top = `${offsetTop - 2}px`;
      if (height !== this.styleProps.height || top !== this.styleProps.top) {
        this.$nextTick(() => this.$emit('resized'));
      }
    },
    onKeyDown (evt, debug = false) {
      'function' === typeof this['on' + evt.key] && this['on' + evt.key](evt);
      debug === true && console.log('[APP] Form filters handled `keydown`:', evt);
    },
    onBackspace (evt) {
      let { key, target: { selectionStart: start, selectionEnd: end } } = evt;
      if (key === 'Backspace' && start === 0 && end === start) {
        let lastTag = this.tags[this.tags.length - 1];
        if (lastTag && 'function' === typeof lastTag.opts.remove) {
          evt.preventDefault();
          evt.stopPropagation();
          lastTag.opts.remove();
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
  $highlight-background: hsl(200, 60%, 95%);
  $highlight-border: hsl(200, 60%, 80%);
  $highlight-color: hsl(200, 60%, 30%);
  $highlight-focus: hsl(200, 60%, 22.5%);
  $danger-background: hsl(10, 85%, 90%);
  $danger-border: hsl(10, 85%, 80%);
  $danger-color: hsl(10, 75%, 30%);
  $danger-focus: hsl(10, 75%, 22.5%);

  @mixin highlight-colors {
    background-color: $highlight-background;
    border-color: $highlight-border;
    color: $highlight-color;
  }

  @mixin danger-colors {
    background-color: $danger-background;
    border-color: $danger-border;
    color: $danger-color;
  }

  .form-group {
    top: -.5rem;
  }
  .form-group > ::v-deep div {
    position: relative;
    .form-control {
      height: auto;
      margin-top: .0625rem;
      .input-textarea-wrapper {
        position: absolute;
        right: .75rem;
        left: .75rem;
        top: 0;
        textarea {
          background-color: transparent;
          position: absolute;
          resize: none;
          width: 100%;
        }
      }
      .input-tags-wrapper {
        display: inline;
        > .input-tag {
          position: relative;
          display: inline-block;
          transition: opacity .25s ease, transform .25s ease;
          > .input-tag-content {
            cursor: default;
            display: inline;
            border: 1px solid;
            border-radius: .25rem;
            margin: 0 .25rem 0 0;
            padding: 0 .3125rem 0 .3125rem;
            @include highlight-colors;
            a {
              @include highlight-colors;
              &:hover {
                color: $highlight-focus;
              }
            }
            &.invalid {
              @include danger-colors;
              a {
                @include danger-colors;
                &:hover {
                  color: $danger-focus;
                }
              }
            }
          }
          &.input-tags-enter-active,
          &.input-tags-leave-active {
          }
          &.input-tags-enter,
          &.input-tags-leave-to {
            opacity: 0;
            transform: scale(.25, .5);
          }
          &.input-tags-leave-active > .input-tag-content {
            @include danger-colors;
            a {
              @include danger-colors;
              &:hover {
                color: $danger-focus;
              }
            }
          }
        }
      }
      .input-textarea-extent {
        visibility: hidden;
      }
    }
    .form-footer {
      cursor: default;
      display: block;
      position: relative;
      left: -.8125rem;
      top: .625rem;
      width: 100%;
    }
    .list-group {
      display: block;
      position: absolute;
      border-radius: .25rem;
      border: 1px solid rgba(0, 0, 0, 0.125);
      border-top-color: rgba(224, 224, 224, 1);
      box-shadow: 0 2px 2px 0 rgba(0, 0, 0, .125);
      max-height: calc( 11 * 2.25rem + 1px );
      width: calc( 100% + 1.625rem);
      transition: height .2s ease;
      overflow-y: auto;
      z-index: 100;
      a, button {
        outline: 0 !important;
      }
      .list-group-item {
        font-size: .875rem;
        padding: .5rem .75rem;
        border: none;
        *:not(:only-child) {
          margin-right: .375rem;
        }
        svg[data-icon='caret-right'] {
          display: none;
          margin-right: 0;
          position: absolute;
          left: .6875rem;
          top: .6875rem;
        }
      }
      .list-group-item-action:hover:not(.selected) {
        z-index: 0;
        color: inherit;
        text-decoration: inherit;
        background-color: white;
      }
      .list-group-item-action.selected {
        z-index: 1;
        color: #495057;
        padding-left: 2rem;
        text-decoration: none;
        background-color: $highlight-background;
        svg[data-icon='caret-right'] {
          display: inline-block;
          left: .6875rem;
        }
      }
      .list-group-item.list-group-item-divider {
        z-index: 2;
        padding: .5rem .75rem;
        font-size: .8125rem;
        border-style: solid;
        border-width: 1px 0 1px 0;
        border-color: rgba(0, 0, 0, 0.125);
        background-color: #f8f8f8;
        color: grey;
        &:first-child {
          padding-top: calc( .5rem + 1px );
          border-top-width: 0;
        }
        &:last-child {
          padding-bottom: calc( .5rem + 1px );
          border-bottom-width: 0;
        }
      }
    }
  }
</style>
