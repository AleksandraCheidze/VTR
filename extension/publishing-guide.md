# Guide for Publishing to Chrome Web Store

## Prerequisites
1. Google Developer account (one-time $5 registration fee)
2. Zip file of your extension
3. Screenshots and promotional images
4. Description and privacy policy

## Step 1: Prepare Your Extension
1. Make sure all files are ready and working correctly
2. Update the manifest.json with final name, version, and description
3. Create a zip file of your extension folder (don't include unnecessary files)

## Step 2: Create Screenshots and Promotional Images
For Chrome Web Store, you'll need:

1. **Icon** (already created in SVG format):
   - 128x128 pixels

2. **Screenshots** (create at least 1-3):
   - 1280x800 or 640x400 pixels
   - Show the extension in action
   - Capture the popup interface
   - Show the text extraction process
   - Show the copied text result

3. **Promotional Images** (optional but recommended):
   - Small: 440x280 pixels
   - Large: 920x680 pixels
   - Marquee: 1400x560 pixels

## Step 3: Publish to Chrome Web Store
1. Go to [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. Sign in with your Google account
3. Pay the one-time $5 developer registration fee (if you haven't already)
4. Click "New Item" and upload your zip file
5. Fill in the store listing:
   - Name: "Video Text Extractor"
   - Summary: Use the short description from store-description.md
   - Detailed description: Use the detailed description from store-description.md
   - Category: Productivity
   - Language: English
   - Upload screenshots and promotional images
   - Set distribution to "Public" (or "Private" for testing)
   - Set regions to "All regions"

6. Set up pricing and distribution:
   - Free extension
   - Available to all regions
   - Check the required checkboxes for compliance

7. Submit for review
   - The review process typically takes a few business days
   - You'll receive an email when your extension is approved or if changes are needed

## Step 4: After Publishing
1. Monitor user feedback and ratings
2. Address any issues in future updates
3. Consider adding new features based on user requests

## Important Notes
- Make sure your extension complies with Chrome Web Store policies
- Ensure your privacy practices are clearly communicated
- Be responsive to user feedback and bug reports
- Keep your extension updated with new Chrome versions
