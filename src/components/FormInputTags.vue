<template>
  <v-tags-input ref="child"
                v-model="text"
                :tags="tagsCopy"
                :class="classes"
                :separators="[';', ',']"
                :add-only-from-autocomplete="true"
                :autocomplete-items="autocompleteItems"
                :autocomplete-always-open="autocompleteOpen"
                :avoid-adding-duplicates="mode !== 'group'"
                :autocomplete-filter-duplicates="mode !== 'group'"
                placeholder="Add proxies, keywords, authors, etc."
                @before-adding-tag="onProcessAddition"
                @before-deleting-tag="onProcessDeletion"
                @tags-changed="onTagsChanged"
  >
    <div slot="autocompleteItem"
         slot-scope="props"
         :class="props.item.type"
         @click="props.performAdd(props.item)"
    >
      <font-awesome-icon :icon="props.item.icon" fixed-width class="mr-1"/>&nbsp;{{ props.item.text }}
    </div>
  </v-tags-input>
</template>

<script>
export default {
  name: 'FormInputTags',
  props: {
    tags: {
      type: Array,
      default: () => [],
    },
    groups: {
      type: Array,
      default: () => [],
    },
  },
  data () {
    return {
      text: '',
      mode: 'group',
      tagsCopy: [],
      groupsCopy: [],
      focused: false,
    };
  },
  computed: {
    classes () {
      try {
        return {
          'allow--enter': this.$refs.child && this.$refs.child.selectedItem !== null,
          'allow--delete': !this.text && this.tags && this.tags.length,
        };
      } catch (e) {
        return {};
      }
    },
    possibleGroups () {
      return this.groupsCopy
        .filter(group => typeof group.isAvailable === 'function' && group.isAvailable() || !!group.isAvailable)
        .map(group => ({ type: 'group', icon: 'tags', ...group }));
    },
    possibleOptions () {
      return this.possibleGroups.reduce((options, group) => {
        options[group.name] = group.fetchOptions()
          .map(option => ({ type: 'option', icon: 'ellipsis-h', ...option }));
        return options;
      }, {});
    },
    filteredGroups () {
      return this.possibleGroups.filter(group => (
        Array.isArray(this.possibleOptions[group.name]) &&
        this.possibleOptions[group.name].filter(option => !this.tagsCopy.find(
          tag => tag.name === option.name && tag.type === option.type,
        )).length
      ));
    },
    autocompleteItems () {
      let items = [];
      if (this.mode === 'group') {
        items = this.filteredGroups;
      } else {
        let [lastTag] = this.tagsCopy.length ? this.tagsCopy.slice(-1) : [undefined];
        items = lastTag ? this.possibleOptions[lastTag.name] : [];
      }
      return items ? items.filter(i => new RegExp('.?' + this.text, 'i').test(i.text)) : [];
    },
    autocompleteOpen () {
      return !!(this.focused && this.autocompleteItems.length);
    },
  },
  created () {
    this.tagsCopy = Array.from(this.tags);
    this.groupsCopy = Array.from(this.groups);
  },
  mounted () {
    if (document && 'function' === typeof document['addEventListener']) {
      document.addEventListener('click', this.onBlurred);
      document.addEventListener('focusin', this.onBlurred);
    }
  },

  destroyed () {
    if (document && 'function' === typeof document['addEventListener']) {
      document.removeEventListener('click', this.onBlurred);
      document.removeEventListener('focusin', this.onBlurred);
    }
  },
  methods: {
    onBlurred (event) {
      if (this.$refs.child.$el.contains(event.target)) {
        this.$refs.child.$refs.newTagInput.focus();
        this.onTagsChanged(null);
        this.focused = true;
      } else {
        this.focused = false;
      }
    },
    onProcessAddition (input) {
      if (!input || !input.tag) return;
      if (this.mode === input.tag.type) {
        if (input.tag.type === 'group') {
          input.tag.classes = 'group current';
          this.mode = 'option';
        } else {
          input.tag.classes = 'option';
          let [group] = this.$refs.child.tagsCopy.slice(-1);
          group.classes = 'group';
          this.mode = 'group';
        }
        input.addTag();
      }
    },
    onProcessDeletion (input) {
      if (!input || !input.tag) return;
      if (input.index !== (this.$refs.child.tagsCopy.length - 1)) {
        this.$refs.child.deleteTag(input.index);
        this.$refs.child.deleteTag(input.index-1);
      } else if (this.mode !== input.tag.type) {
        if (input.tag.type === 'group') {
          this.mode = 'group';
        } else {
          let [group] = this.$refs.child.tagsCopy.slice(-2, -1);
          group.classes = 'group current';
          this.mode = 'option';
        }
        input.deleteTag();
      }
    },
    onTagsChanged (newTags) {
      let component = this.$refs.child;
      if (newTags) {
        this.tagsCopy = newTags;
        if (this._events['update:tags']) {
          this.$emit('update:tags', this.tagsCopy);
        }
      }
      if (component && component.filteredAutocompleteItems) {
        if (component.selectedItem > (component.filteredAutocompleteItems.length - 1)) {
          component.selectDefaultItem();
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>

</style>
