<template>
  <BContainer fluid class="content">
    <BRow align-h="center">
      <BCol cols="12" xl="7">
        <BCard class="h-100" title="Page not found">
          <hr class="mt-1 mb-4">
          <p>
            Sorry! Looks like you've followed a broken link
            or entered a URL that doesn't exist on this site.
          </p>
        </BCard>
      </BCol>
    </BRow>
  </BContainer>
</template>

<script>
export default {
  name: 'ViewMissing',
};
</script>
