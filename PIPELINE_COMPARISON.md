# Buildkite Pipeline Comparison

This repository includes two different Buildkite pipeline configurations demonstrating different approaches to container image management.

## Files

- `buildkite-pipeline.yml` - **Kubernetes Plugin Approach**
- `buildkite-pipeline-simple.yml` - **Simple Image Syntax Approach**

## Key Differences

### 1. Image Specification

**Kubernetes Plugin Approach:**
```yaml
steps:
  - label: ":node: Frontend tests"
    command: |
      cd frontend
      npm ci
      npm test
    plugins:
      - kubernetes:
          podSpec:
            containers:
              - image: node:18
                name: frontend-test
                workingDir: /buildkite/builds
```

**Simple Image Syntax:**
```yaml
image: "ubuntu:22.04" # Pipeline default

steps:
  - label: ":node: Frontend tests"
    command: |
      cd frontend
      npm ci
      npm test
    image: "node:18" # Step-specific override
```

### 2. Configuration Complexity

| Aspect | Kubernetes Plugin | Simple Image Syntax |
|--------|------------------|---------------------|
| **Lines of config** | ~15 lines per step | ~5 lines per step |
| **Complexity** | High | Low |
| **Resource control** | Full (CPU, memory, volumes) | Basic |
| **Learning curve** | Steep | Gentle |

### 3. Features Comparison

#### Kubernetes Plugin Advantages:
- ✅ **Resource Management** - CPU/memory requests and limits
- ✅ **Volume Mounts** - Persistent storage and caching
- ✅ **Multi-container Pods** - Sidecar containers (e.g., database)
- ✅ **Security Contexts** - Custom user IDs, privileges
- ✅ **Network Policies** - Advanced networking controls
- ✅ **Service Accounts** - Kubernetes RBAC integration

#### Simple Image Syntax Advantages:
- ✅ **Simplicity** - Easy to read and write
- ✅ **Quick Setup** - Minimal configuration required
- ✅ **Default Images** - Pipeline-level defaults
- ✅ **Migration Friendly** - Easy to convert existing pipelines
- ✅ **Standard Buildkite** - Works with any agent type

### 4. Example Use Cases

#### Choose Kubernetes Plugin When:
- Building complex applications requiring multiple services
- Need precise resource allocation and limits
- Require persistent volumes or caching
- Running in production with strict security requirements
- Need advanced networking or service mesh integration

#### Choose Simple Image Syntax When:
- Building simple applications or libraries
- Prototyping or getting started quickly
- Standard CI/CD workflows without complex requirements
- Teams new to containerized builds
- Compatibility with non-Kubernetes agents

### 5. Performance Implications

**Kubernetes Plugin:**
- Slower startup (pod creation overhead)
- Better resource isolation
- Supports resource limits and QoS
- Can leverage node affinity and scheduling

**Simple Image Syntax:**
- Faster startup (direct container execution)
- Shared resources with host
- Less overhead for simple tasks
- Works with any agent type

### 6. Migration Path

Converting from Kubernetes plugin to simple syntax:

```yaml
# Before (Kubernetes plugin)
- label: "Test"
  plugins:
    - kubernetes:
        podSpec:
          containers:
            - image: node:18
              name: test

# After (Simple syntax)  
- label: "Test"
  image: "node:18"
```

## Recommendations

### For This Calculator App:
- **Development/Testing**: Use `buildkite-pipeline-simple.yml`
- **Production**: Use `buildkite-pipeline.yml` for better resource control

### General Guidelines:
- **Start Simple**: Begin with simple image syntax
- **Scale Up**: Move to Kubernetes plugin as needs grow
- **Hybrid Approach**: Mix both in the same pipeline as needed

Both pipelines achieve the same goal but with different levels of complexity and control. Choose based on your team's needs and infrastructure requirements.
