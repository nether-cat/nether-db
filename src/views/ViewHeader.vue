<script>
export default {
  name: 'ViewHeader',
  render () {
    return (
      <div class="header container-fluid px-0">
        <BRow class="mx-0">
          <BCol cols="12" sm="6" class="px-0">
            <RouterLink to="/" exact>
              <BImg src={require('@/assets/palim-logo.png')} alt="PaLimDB"/>
            </RouterLink>
          </BCol>
          <BCol cols="12" sm="6" class="px-0">
            <BNav class="float-right px-3">
              <BNavItem to="/contact" disabled>Contact</BNavItem>
              <BNavItem to="/imprint" disabled>Imprint</BNavItem>
              <BNavItem to="/privacy" disabled>Privacy</BNavItem>
            </BNav>
          </BCol>
        </BRow>
      </div>
    );
  },
};
</script>

<style lang="scss" scoped>
  .header {
    display: block;
    background-color: white;
    img {
      max-height: 111px;
      padding: 5px 10px;
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
  }
</style>
