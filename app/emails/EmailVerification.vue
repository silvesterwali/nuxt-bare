<script setup lang="ts">
defineProps<{
  appName: string;
  verificationUrl: string;
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
          Verify your email address
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
          Thanks for signing up for {{ appName }}! We're excited to have you as
          an early user.
        </EText>
        <ESection style="text-align: center; margin: 30px 0">
          <EButton
            :href="verificationUrl"
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
            Verify Email
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
          If you didn't sign up for {{ appName }}, you can safely ignore this
          email.
        </EText>
      </EContainer>
    </EBody>
  </EHtml>
</template>
