---
title: "Introduction to the Go Helm client"
summary: "A client similar to the one for Kubernetes."
date: 2021-01-31T10:28:46+02:00
draft: false
---

One nice addon when using Helm is [`fullstatus`](https://github.com/marckhouzam/helm-fullstatus).
This addon gives you the list of all the API resources started to run a specific
release.

Recently, I had to do something similar in Go which first required me to
get all the Helm releases on a cluster. The documentation I found for
this simple task was not great, I am thus writing it down here.

## Initial setup

- A Go module only containing an empty `main.go` and a `go.mod`.
- A local machine with a `kubeconfig` to communicate with a Kubernetes cluster.

If your context is set, you do not need to specify a `kubeconfig`.

## Getting releases

``` go
package main

import (
	"flag"
	"log"
	"path/filepath"

	"helm.sh/helm/v3/pkg/action"
	"helm.sh/helm/v3/pkg/kube"
	"k8s.io/client-go/util/homedir"
)

func main() {
	var kubeconfig *string
	if home := homedir.HomeDir(); home != "" {
		kubeconfig = flag.String("kubeconfig", filepath.Join(home, ".kube", "config"), "(optional) absolute path to the kubeconfig file")
	} else {
		kubeconfig = flag.String("kubeconfig", "", "absolute path to the kubeconfig file")
	}
	flag.Parse()

	actionConfig := new(action.Configuration)
	err := actionConfig.Init(kube.GetConfig(*kubeconfig, "", ""), "", "", log.Printf)
	if err != nil {
		log.Fatal(err)
	}

	releases, err := action.NewList(actionConfig).Run()
	if err != nil {
		log.Fatal(err)
	}

	for _, release := range releases {
		log.Println(release.Name)
	}
}
```

The `*action.Configuration` can be reused to interact with Helm. As you might
have noticed, you do not need to register any API group & version to a scheme.

## Using releases

The `releases` include manifests which are extremely useful to understand what
is being deployed (this is what `helm fullstatus` does). For example, you can
easily know which releases deploy which images:

``` go
var cleanLine string
var imageLine struct {
    Image string `yaml:"image"`
}
images := make(map[string]bool)

for _, release := range releases {
    scanner := bufio.NewScanner(strings.NewReader(release.Manifest))
    for scanner.Scan() {
        cleanLine = strings.Trim(scanner.Text(), " ")
        // Could be '$(params.parser-image)' due to template.
        if (strings.HasPrefix(cleanLine, "image: ") || strings.HasPrefix(cleanLine, "- image: ")) && !strings.Contains(cleanLine, "$") {
            cleanLine = strings.TrimLeft(scanner.Text(), "- ")
            err := yaml.Unmarshal([]byte(cleanLine), &imageLine)
            if err != nil {
                log.Fatal(err)
            }
            // If you don't specify a tag, Kubernetes assumes you mean `latest`.
            if !strings.Contains(imageLine.Image, ":") {
                imageLine.Image += ":latest"
            }
            images[imageLine.Image] = true
        }
    }

    log.Printf("%s : %v", release.Name, images)
}
```
