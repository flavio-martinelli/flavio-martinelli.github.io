---
layout: post
title: "ReLU Playground: how complex are the dynamics of one neuron learning another one?"
date: 2025-04-23 
description: An interactive playground ⛹️‍♂️
tags: learning dynamics
categories: interactive
thumbnail: assets/img/posts/reluplayground.gif
load_relu_playground: true
---

<!-- <h2>How complex are the dynamics of one neuron learning another one?</h2> -->
<p>⚠️This page is under construction⚠️</p>
<p>But in the meantime you can play with the relus by moving them around with the mouse, or type in some values. Press play to start learning!</p>
<p>Can you find which initialisations can converge to the teacher? How do other solutions look like? By looking at the different phase spaces, can you get an intuitive understanding of the learning dynamics?</p>

<link rel="stylesheet" href="/assets/js/reluplayground/style.css">
<!-- <script src="https://cdn.jsdelivr.net/npm/p5@1.11.1/lib/p5.min.js"></script> -->
<!-- <script src="https://cdnjs.cloudflare.com/ajax/libs/numjs/0.14.2/numjs.js"></script> -->
<script src="/assets/js/reluplayground/drawUtils.js"></script> 
<script src="/assets/js/reluplayground/utils.js"></script>
<script src="/assets/js/reluplayground/explanations.js"></script> 
<script src="/assets/js/reluplayground/interaction_input_boxes.js"></script> 
<script src="/assets/js/reluplayground/interactions_output_space.js"></script> 
<script src="/assets/js/reluplayground/buttons_and_visuals.js"></script>
<script src="/assets/js/reluplayground/ml.js"></script>
<script src="/assets/js/reluplayground/sketch.js"></script>

<div class="container">
    <div id="canvas-container"></div>
</div>

<!-- TODOs:

- negative learning rates (reverse learning button): useful explore how to reach a specific state

- menu to select pre-set initialisations. There's space above the WA and WB boxes

- two columns: on the right a scrollable text box with the actual blog post!

 -->