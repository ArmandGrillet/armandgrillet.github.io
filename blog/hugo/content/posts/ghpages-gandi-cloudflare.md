---
title: "Enforce HTTPS on GitHub Pages with a Gandi domain name for free"
date: 2020-11-01T10:28:46+02:00
draft: false
---

My personal website was still accessible using HTTP until recently and, even if it doesn't matter much for such a website, I wanted to change that.

My domain is on Gandi, which doesn't offer [free SSL certificates for existing domain names](https://www.gandi.net/en-US/certificates/p/free-ssl-certificates). The solution I've found to enforce HTTPS is to use CloudFlare, here is a tutorial about how to configure this.

# Initial setup

- A GitHub Pages project. In this case, https://github.com/armandgrillet/armandgrillet.github.io
- A domain name bought on Gandi.
- A Cloudflare account

# Getting rid of Gandi

First, we're gonna get Gandi out of the equation.

Go on Cloudflare, add a site, and then go to the "DNS" tab.

Copy the provided Cloudflare nameservers and use them in Gandi: `<yourdomain.com>/nameservers/External domain names`.

![Gandi](/img/posts/ghpages-gandi-cloudflare/gandi.png)

We will not use Gandi anymore.

# Setting Cloudflare to know about your Github Pages project

GitHub has documentation about managing a custom domain: https://docs.github.com/en/free-pro-team@latest/github/working-with-github-pages/managing-a-custom-domain-for-your-github-pages-site#configuring-a-subdomain

Follow the help and create the `CNAME` record in Cloudflare (still in the DNS management section of your site).

This should be enough to have your website hosted on GitHub being displayed when accessing your domain using a web browser.

# Enforcing HTTPS

The settings of your GitHub project will sadly not allow you to enforce HTTPS.

![GitHub HTTPS](/img/posts/ghpages-gandi-cloudflare/github-https.png)

This is where Cloudflare becomes important. Go back to it and go to the "Page Rules" tab.

From there, create a rule on `<yourdomain.com>/*` where the settings are "Always use HTTPS".

This should be enough to make your website accessible via `HTTPS` and even redirect users visiting `http://<yourdomain.com>` to the HTTPS equivalent.

# Updating your SSL/TLS encryption mode

Last but not least, you can change your SSL/TLS encryption mode on Cloudflare. Just go on the "SSL/TLS" tab and update it. Personally, I have it set up to `Full`.

[@ArmandGrillet](https://twitter.com/ArmandGrillet)
