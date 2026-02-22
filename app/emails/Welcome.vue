<script setup lang="ts">
defineProps<{
  appName: string;
  firstName: string;
  loginUrl: string;
}>();
</script>

<template>
  <EHtml lang="en">
    <EHead />
    <EBody style="background-color: #ffffff; font-family: Arial, sans-serif">
      <EContainer style="margin: 0 auto; padding: 20px; max-width: 600px">
        <EHeading as="h2" style="color: #333; margin-bottom: 20px; text-align: center">
          Welcome to {{ appName }}, {{ firstName }}!
        </EHeading>
        <EText
          style="
            color: #555;
            line-height: 1.6;
            margin-bottom: 20px;
            font-size: 16px;
            text-align: center;
          "
        >
          Your account is now active. We're excited to have you on board!
        </EText>
        <ESection style="text-align: center; margin: 30px 0">
          <EButton
            :href="loginUrl"
            style="
              background-color: #16a34a;
              color: white;
              padding: 12px 24px;
              border-radius: 6px;
              font-weight: bold;
              font-size: 16px;
              text-decoration: none;
              display: inline-block;
            "
          >
            Go to {{ appName }}
          </EButton>
        </ESection>
      </EContainer>
    </EBody>
  </EHtml>
</template>
