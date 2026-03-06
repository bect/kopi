# Kopi Hugo Theme

Kopi is a high-performance Hugo theme featuring a sophisticated dark-mode aesthetic and a structured 2-column layout. Built for speed and seamless navigation, it utilizes Turbo for instant page transitions.

[![Deploy Demo to GitHub Pages](https://github.com/bect/kopi/actions/workflows/deploy.yml/badge.svg)](https://github.com/bect/kopi/actions/workflows/deploy.yml)

**[Live Demo](httpshttps://bect.github.io/kopi/)**

[![Theme Screenshot](https://raw.githubusercontent.com/bect/kopi/main/images/screenshot.png)](httpshttps://bect.github.io/kopi/)

## Features

- **Modern & Fast**: Built with performance in mind.
- **Responsive Design**: Looks great on desktops, tablets, and mobile devices.
- **Dark Mode**: Automatic dark mode based on user's system preference.
- **Turbo Navigation**: Near-instant page loads for a fluid browsing experience.
- **Mermaid.js Support**: Create diagrams and flowcharts directly in your markdown.
- **2-Column Layout**: A clean, magazine-style layout for your content.
- **Radio Player**: Built-in radio player widget with visualizer and playlist support.
- **GitHub Pages Deployment**: Includes a ready-to-use GitHub Actions workflow for easy deployment.

## Installation

This theme requires **Hugo Extended** version `0.157.0` or higher.

1.  Add the theme as a git submodule:
    ```bash
    git submodule add https://github.com/bect/kopi.git themes/kopi
    ```

2.  Add the theme to your `hugo.yaml`:
    ```yaml
    theme: 'kopi'
    ```

## Configuration

You can configure the theme by adding the following to your site's `hugo.yaml`. See the `exampleSite/hugo.yaml` for a full example.

```yaml
baseURL: 'https://example.com/'
languageCode: 'en-US'
title: 'Your Site Title'
theme: 'kopi'

params:
  subtitle: 'Your site subtitle or tagline'
  author:
    name: "Your Name"
    bio: "A short bio about yourself."
    link: "#" # Link to your profile or about page
    role: "Your Role"

menus:
  main:
    - name: 'Home'
      pageRef: '/'
      weight: 10
    - name: 'About'
      url: '/about'
      weight: 20

mediaTypes:
  application/radio+json:
    suffixes:
      - json

outputFormats:
  RADIO:
    mediaType: application/radio+json
    baseName: radio
    isPlainText: true
    notAlternative: true

outputs:
  home:
    - HTML
    - RSS
    - JSON
    - RADIO
```

## Radio Widget

This theme includes an optional radio player widget. Here’s how to configure it.

### How to Enable or Disable

The radio widget is controlled by your site's `hugo.yaml` configuration.

*   **To Enable**, add `RADIO` to the `outputs` list for your home page. The `Configuration` section above shows an example of this.

*   **To Disable**, simply remove `RADIO` from the `outputs` list. The widget will not appear.
    ```yaml
    outputs:
      home:
        - HTML
        - RSS
        - JSON
        # The "RADIO" entry has been removed
    ```

### How to Customize the Playlist

You can change the list of radio stations by editing the `/data/radio.yaml` file. Add or remove stations using the following format for each entry:

```yaml
- title: "Station Name"
  description: "A short description of the station."
  stream_url: "https://stream.url/here"
  location: "City, Country"
  website_url: "https://station-website.com"
```

## License

This theme is licensed under the **MIT License**. See the LICENSE file for more details.

## Acknowledgements

- Turbo.js for the fast navigation.
- Mermaid.js for diagram rendering.