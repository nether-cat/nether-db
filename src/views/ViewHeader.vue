<script>
export default {
  name: 'ViewHeader',
  data() {
    return {
      isVisible: true,
    };
  },
  render () {
    return (
      <div v-observe-visibility={process.env.VUE_SSR ? false : {
        callback: isVisible => (this.isVisible = isVisible),
        intersection: {
          rootMargin: `${Math.ceil(window.innerHeight / 3)}px 0px 0px 0px`,
        },
      }} class="header container-fluid px-0">
        <BRow class="mx-0">
          <BCol cols="12" sm="6" class="px-0">
            <object class="app-logo" name="Logo" role="img" aria-label="Logo" data={require('@/assets/varda-logo.svg')}/>
          </BCol>
          <BCol cols="12" sm="6" class="px-0">
            <BNav class="float-right px-3">
              <BNavItem to="/contact" disabled>Contact</BNavItem>
              <BNavItem to="/imprint" disabled>Imprint</BNavItem>
              <BNavItem to="/privacy" disabled>Privacy</BNavItem>
            </BNav>
          </BCol>
        </BRow>
        <Transition name="fade-opacity">{ this.isVisible || (
          <BButton v-scroll-to={{ el: 'body', force: false, offset: 111 }} variant="link">
            <FontAwesomeIcon icon={['far', 'arrow-alt-circle-up']} size="5x"/>
          </BButton>
        )}</Transition>
      </div>
    );
  },
};
</script>

<style lang="scss" scoped>
  .header {
    display: block;
    background-color: white;
    .app-logo {
      border-style: none;
      vertical-align: middle;
      max-height: 111px;
      padding: 1rem;
    }
    .nav {
      .nav-item::before {
        content: '|';
      }
      .nav-item:first-child::before {
        content: '';
      }
      .nav-link {
        display: inline-block;
        padding: 0.5rem 0.5rem;
      }
    }
    > .btn.btn-link {
      z-index: 1024;
      position: fixed;
      bottom: 1.75rem;
      right: 1.75rem;
      padding: 0;
      border-width: 0;
      border-radius: 50%;
      font-size: .75rem;
      background-color: rgba(0, 0, 0, .05);
      &:hover {
        background-color: rgba(0, 0, 0, .1);
      }
      @media (min-width: 992px) {
        font-size: 1rem;
      }
    }
  }
  .fade-opacity-enter-active,
  .fade-opacity-leave-active {
    transition: opacity 1s ease;
  }
  .fade-opacity-enter,
  .fade-opacity-leave-to {
    opacity: 0;
  }
  .fade-opacity-enter-to,
  .fade-opacity-leave {
    opacity: 1;
  }
</style>
