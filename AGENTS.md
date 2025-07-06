# AGENTS

## Commands
```bash
npm install
npm run dev
npm run build && npm run start
npm run lint
pip install -r tank-royale-server/requirements.txt
python3 tank-royale-server/run_server.py
pytest <path/to/test>::<test_name>
```

## Style
- Prettier (.prettierrc.json): semi, tabWidth=2, singleQuote=false, trailingComma=es5, arrowParens=always
- ESLint (eslint.config.mjs): extends next/core-web-vitals, next/typescript
- TS (tsconfig.json): strict=true, paths "@/*"
- Imports: external → @/absolute → ./relative
- React: PascalCase components, camelCase hooks/vars
- Errors: try/catch with console.error or raise exceptions

## Cursor/Copilot rules: none
