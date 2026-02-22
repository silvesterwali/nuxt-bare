<script setup lang="ts">
defineProps<{
  appName: string;
  resetUrl: string;
}>();
</script>

<template>
  <EHtml lang="en">
    <EHead />
    <EBody style="background-color: #ffffff; font-family: Arial, sans-serif">
      <EContainer style="margin: 0 auto; padding: 20px; max-width: 600px">
        <EHeading
          as="h2"
          style="color: #333; margin-bottom: 20px; text-align: center"
        >
          Reset Your Password
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
          We received a request to reset your password. Click the button below
          to choose a new one.
        </EText>
        <ESection style="text-align: center; margin: 30px 0">
          <EButton
            :href="resetUrl"
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
            Reset Password
          </EButton>
        </ESection>
        <EText
          style="
            color: #999;
            font-size: 12px;
            margin-top: 20px;
            text-align: center;
          "
        >
          If you didn't ask to reset your password, you can safely ignore this
          email.
        </EText>
      </EContainer>
    </EBody>
  </EHtml>
</template>
