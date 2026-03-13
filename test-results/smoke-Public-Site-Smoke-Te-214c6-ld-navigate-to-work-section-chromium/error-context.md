# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to main content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - main [ref=e3]:
    - generic [ref=e4]:
      - paragraph [ref=e5]: Loading
      - heading "Preparing the next view" [level=1] [ref=e6]
      - paragraph [ref=e7]: The page is rendering. This should only take a moment.
  - region "Notifications (F8)":
    - list
```