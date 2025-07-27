/**
 * Map of supported programming languages with value and labels.
 * @type {Object}
 */
export const languageMap = {
    js: { value: 'javascript', label: 'JavaScript' },
    ts: { value: 'typescript', label: 'TypeScript' },
    py: { value: 'python', label: 'Python' },
    cpp: { value: 'cpp', label: 'C++' },
    c: { value: 'c', label: 'C' },
    java: { value: 'java', label: 'Java' },
    html: { value: 'html', label: 'HTML' },
    css: { value: 'css', label: 'CSS' },
};

/**
 * Map of default code snippet for supported programming languages.
 * @type {Object}
 */
export const defaultsSnippets = {
    javascript: "console.log('Hello, World!');",
    typescript: "console.log('Hello, World!');",
    python: "print('Hello, World!')",
    cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}',
    c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
    java: 'public class Main {\n\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n\n}',
    html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n\t<meta charset="UTF-8">\n\t<meta name="viewport" content="width=device-width, initial-scale=1.0">\n\t<title>Hello</title>\n</head>\n<body>\n\t<h1>Hello, World!</h1>\n</body>\n</html>',
    css: 'body {\n    background-color: #ffffff;\n}',
};

/**
 * Map of Judge0 supported programming languages with language Ids.
 * @type {Object}
 */
export const judge0LanguagesIds = {
    c: 50,
    cpp: 54,
    java: 62,
    js: 63,
    py: 71,
    ts: 74,
};
