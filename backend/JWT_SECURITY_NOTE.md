# JWT 安全配置说明

## 问题描述
JWT签名使用HS512算法时，密钥长度必须至少为512位（64字节）。之前的密钥只有312位，导致安全异常。

## 解决方案
更新了 `application.yml` 中的JWT密钥配置：
- 原密钥：39个字符（312位）
- 新密钥：82个字符（656位）

## 生产环境建议

1. **使用环境变量**：不要在配置文件中硬编码密钥
   ```yaml
   jwt:
     secret: ${JWT_SECRET}
   ```

2. **使用密钥生成工具**：
   ```java
   // 使用Java代码生成安全密钥
   import io.jsonwebtoken.security.Keys;
   import io.jsonwebtoken.SignatureAlgorithm;
   
   Key key = Keys.secretKeyFor(SignatureAlgorithm.HS512);
   String base64Key = Base64.getEncoder().encodeToString(key.getEncoded());
   ```

3. **定期轮换密钥**：建议每3-6个月更换一次密钥

4. **使用非对称加密**：考虑使用RS256或ES256算法替代HS512

## 密钥长度要求
- HS256: 至少256位（32字节）
- HS384: 至少384位（48字节）
- HS512: 至少512位（64字节）

## 参考资料
- [RFC 7518 - JSON Web Algorithms (JWA)](https://tools.ietf.org/html/rfc7518#section-3.2)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725) 