# Model Architecture

## Introduction
Image forgery detection is a binary classification problem (Authentic vs. Forged) with the added requirement of explainability (localizing the forgery).

## Why Lightweight Models?
We prioritize models like MobileNetV3 and EfficientNet to ensure the backend can process requests quickly, even without specialized GPU hardware in standard deployment environments.

## Architecture Diagram

```
[ Input Image (224x224x3) ]
          |
          v
[ Backbone (MobileNetV3 / EfficientNet) ] ---> Extracts Feature Maps
          |
          v
[ Global Average Pooling ]
          |
          v
[ Dense Layer (Classifier) ] ---> Output: Forgery Probability
          |
          +---> [ Grad-CAM Processor ] ---> Heatmap Generation
```

## Backbones

### MobileNetV3Small
Chosen for its extreme efficiency. It uses depthwise separable convolutions and squeeze-and-excitation modules. Ideal for low-resource environments.

### EfficientNetB0/B3
Provides a better accuracy-efficiency tradeoff. EfficientNet scales depth, width, and resolution uniformly. B0 is fast, while B3 offers higher accuracy at the cost of some speed.

## Feature Fusion (Advanced Concept)
Future iterations may implement dual-stream networks (e.g., RGB stream + SRM Noise stream) combined via concatenation before the classifier head to better detect subtle splicing artifacts.

## Classifier Head
*   Global Average Pooling 2D
*   Dropout (rate=0.5) to prevent overfitting
*   Dense (1 unit, Sigmoid activation) for binary classification

## Explainability: Grad-CAM
Gradient-weighted Class Activation Mapping (Grad-CAM) is used to produce heatmaps.
It uses the gradients of the target concept (forged class) flowing into the final convolutional layer to produce a coarse localization map highlighting important regions in the image.

## Training Strategy
*   **Transfer Learning**: Backbones are pre-trained on ImageNet.
*   **Fine-tuning**: We train the classifier head first, then unfreeze the top layers of the backbone and fine-tune with a low learning rate.
*   **Augmentation**: Critical for generalization (rotations, flips, slight noise).

## Expected Performance
On standard datasets like CASIA v2.0, this architecture typically achieves > 85% accuracy.

## Demo Mode
When `DEMO_MODE=true` in `.env`, the backend skips actual model inference and returns simulated results based on basic image properties to allow UI testing without loading large model files.
