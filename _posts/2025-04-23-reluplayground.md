---
layout: post
title: "ReLU Playground: how complex are the dynamics of one neuron learning another one?"
date: 2025-04-23 
description: An interactive playground ⛹️‍♂️
tags: learning dynamics
categories: interactive
thumbnail: assets/img/posts/reluplayground.gif
load_relu_playground: true
og_image: assets/img/posts/reluplayground.png
---

<!-- <h2>How complex are the dynamics of one neuron learning another one?</h2> -->
<p>⚠️This page is under construction⚠️</p>
<p>But in the meantime you can play with the relus by moving them around with the mouse, or type in some values, or move points in the phase-spaces. Press play to start learning!</p>
<p>Can you find which initialisations can converge to the teacher? How do other solutions look like? By looking at the different phase spaces, can you get an intuitive understanding of the learning dynamics?</p>


<link rel="stylesheet" href="/assets/js/reluplayground/style.css">
<!-- <script src="https://cdnjs.cloudflare.com/ajax/libs/numjs/0.14.2/numjs.js"></script> -->
<script src="/assets/js/reluplayground/drawUtils.js"></script> 
<script src="/assets/js/reluplayground/utils.js"></script>
<script src="/assets/js/reluplayground/explanations.js"></script> 
<script src="/assets/js/reluplayground/option_inits.js"></script>
<script src="/assets/js/reluplayground/interaction_input_boxes.js"></script> 
<script src="/assets/js/reluplayground/interactions_output_space.js"></script> 
<script src="/assets/js/reluplayground/buttons_and_visuals.js"></script>
<script src="/assets/js/reluplayground/ml.js"></script>
<script src="/assets/js/reluplayground/sketch.js"></script>

<div class="container">
    <div id="canvas-container"></div>
</div>

<strong>DETAILS:</strong>
<ul> 
<li>The student network is parameterized with 4 variables: f(x) =  a ReLU(wx + b) + c
<li>We can transform the parameterization to make it phenomenologically intuitive, from 4 continuous variables to 3 continuous and 1 discrete. The kink of the relu is k=-b/w, while the slope is computed as m=a|w| and the direction of the relu is simply s=sign(w). c remains unchanged. The grey boxes show relu dynamics in different slices of the parameter space.
<li>The teacher network is defined phenomenologically as t(x) = m  relu(s(x-k)) + c.
<li>The 1D input data is densely sampled with a uniform distribution (std=1). There are no datapoints outside the grey area of the "INPUT-OUTPUT SPACE". This creates some interesting and under-explored boundary effects.
<li>Training is done through standard full-batch gradient descent.

<!-- TODOs:

- negative learning rates (reverse learning button): useful explore how to reach a specific state

- menu to select pre-set initialisations. There's space above the WA and WB boxes

- two columns: on the right a scrollable text box with the actual blog post!

 -->