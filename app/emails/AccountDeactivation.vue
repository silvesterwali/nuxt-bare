<script setup lang="ts">
defineProps<{
  appName: string;
  firstName: string;
}>();
</script>

<template>
  <EHtml lang="en">
    <EHead />
    <EBody style="background-color: #ffffff; font-family: Arial, sans-serif">
      <EContainer style="margin: 0 auto; padding: 20px; max-width: 600px">
        <EHeading
          as="h2"
          style="color: #ef4444; margin-bottom: 20px; text-align: center"
        >
          Account Deactivated
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
          Hi {{ firstName }}, your {{ appName }} account has been deactivated.
        </EText>
        <EText
          style="
            color: #555;
            line-height: 1.6;
            margin-bottom: 20px;
            font-size: 16px;
            text-align: center;
          "
        >
          If you believe this is a mistake, please contact support.
        </EText>
        <ESection style="text-align: center; margin: 30px 0">
          <EButton
            href="mailto:support@example.com"
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
            Contact Support
          </EButton>
        </ESection>
      </EContainer>
    </EBody>
  </EHtml>
</template>
