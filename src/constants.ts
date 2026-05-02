import { Question, FFFQuestionSet } from "./types";

export const FFF_QUESTION_SETS: FFFQuestionSet[] = [
  {
    main: {
      id: "fff1",
      text: "Place these devices in order of screen size, starting with the largest.",
      options: ["Desktop computer", "Laptop", "Tablet", "Smartphone"],
      correctOrder: [0, 1, 2, 3]
    },
    alternate: {
      id: "fff1_alt",
      text: "Put the following stages of human life in chronological order from youngest to oldest.",
      options: ["Adult", "Child", "Baby", "Teenager"],
      correctOrder: [2, 1, 3, 0]
    }
  },
  {
    main: {
      id: "fff2",
      text: "Order the following data storage units from the smallest capacity to the largest.",
      options: ["Gigabyte(GB)", "Kilobyte(KB)", "Terabyte(TB)", "Megabyte(MB)"],
      correctOrder: [1, 3, 0, 2]
    },
    alternate: {
      id: "fff2_alt",
      text: "Rank the following file types based on the storage space they typically require, starting with the least.",
      options: ["Movie", "Image", "Song", "Text File"],
      correctOrder: [3, 1, 2, 0]
    }
  },
  {
    main: {
      id: "fff3",
      text: "Place these programming steps in the correct sequence for compiling and executing a program.",
      options: ["Run Program", "Compile Code", "Write Code", "See Output"],
      correctOrder: [2, 1, 0, 3]
    },
    alternate: {
      id: "fff3_alt",
      text: "Identify the proper sequence of stages in a typical software development process.",
      options: ["Testing", "Design", "Deployment", "Coding"],
      correctOrder: [1, 3, 0, 2]
    }
  },
  {
    main: {
      id: "fff4",
      text: "Select the correct order of actions required to log into a website.",
      options: ["Enter password", "Enter username", "Click login button", "Access dashboard"],
      correctOrder: [1, 0, 2, 3]
    },
    alternate: {
      id: "fff4_alt",
      text: "Determine the correct sequence for sending a message in a messaging application.",
      options: ["Type message", "Open chat", "Press send", "Message delivered"],
      correctOrder: [1, 0, 2, 3]
    }
  },
  {
    main: {
      id: "fff5",
      text: "Put these web development technologies in the order beginners usually learn them.",
      options: ["CSS", "HTML", "JavaScript", "React"],
      correctOrder: [1, 0, 2, 3]
    },
    alternate: {
      id: "fff5_alt",
      text: "Arrange these keyboard letters according to their position from left to right on a standard keyboard row.",
      options: ["S", "D", "F", "A"],
      correctOrder: [3, 0, 1, 2]
    }
  },
  {
    main: {
      id: "fff6",
      text: "Choose the correct workflow of Git commands used before sending changes to a remote repository.",
      options: ["add", "commit", "push", "pull"],
      correctOrder: [3, 0, 1, 2]
    },
    alternate: {
      id: "fff6_alt",
      text: "Order these numbers based on their cube values, beginning with the smallest.",
      options: ["Cube of 5", "Cube of 2", "Cube of 4", "Cube of 3"],
      correctOrder: [1, 3, 2, 0]
    }
  },
  {
    main: {
      id: "fff7",
      text: "Identify the correct order of these numbers as they appear on the number line from smallest to largest.",
      options: ["-9", "5", "-3", "7"],
      correctOrder: [0, 2, 1, 3]
    },
    alternate: {
      id: "fff7_alt",
      text: "Arrange these powers of 2 from the smallest value to the largest.",
      options: ["2⁵", "2³", "2⁷", "2⁴"],
      correctOrder: [1, 3, 0, 2]
    }
  },
  {
    main: {
      id: "fff8",
      text: "Rank these common internet file types by their typical file size, starting with the smallest.",
      options: ["Text file (.txt)", "Image file (.jpg)", "Video file (.mp4)", "Audio file (.mp3)"],
      correctOrder: [0, 1, 3, 2]
    },
    alternate: {
      id: "fff8_alt",
      text: "Determine the usual sequence of components in a basic program structure.",
      options: ["End Program", "Processing", "Output", "Input"],
      correctOrder: [3, 1, 2, 0]
    }
  },
  {
    main: {
      id: "fff9",
      text: "Place the following steps in the correct order for browsing a website.",
      options: ["Page loads", "Open browser", "Enter website URL", "Website displays"],
      correctOrder: [1, 2, 0, 3]
    },
    alternate: {
      id: "fff9_alt",
      text: "Choose the correct sequence involved in installing a mobile app from an app store.",
      options: ["Open app", "Click install", "Search for the app", "Installation completes"],
      correctOrder: [2, 1, 3, 0]
    }
  },
  {
    main: {
      id: "fff10",
      text: "Arrange these units of time in increasing order.",
      options: ["Hour", "Second", "Minute", "Day"],
      correctOrder: [1, 2, 0, 3]
    },
    alternate: {
      id: "fff10_alt",
      text: "Select the correct precedence order for these mathematical operations.",
      options: ["Addition", "Multiplication", "Division", "Subtraction"],
      correctOrder: [0, 3, 1, 2]
    }
  }
];

export const HOT_SEAT_QUESTIONS: Record<string, Question[]> = {
  easy: [
    // Cycle 1
    { id: "e1_1", text: "How many bits are required to represent decimal number 255?", options: ["7", "8", "9", "16"], correctIndex: 1, difficulty: 'easy' },
    { id: "e1_2", text: "Which of the following is NOT a property of ACID in databases?", options: ["Atomicity", "Consistency", "Isolation", "Duplication"], correctIndex: 3, difficulty: 'easy' },
    { id: "e1_3", text: "What will happen if you divide an integer by zero in most programming languages?", options: ["Returns 0", "Returns infinity", "Runtime error", "Compiles successfully and runs"], correctIndex: 2, difficulty: 'easy' },
    // Cycle 2
    { id: "e2_1", text: "What is the primary purpose of normalization in databases?", options: ["Increase redundancy", "Improve UI", "Reduce data redundancy", "Speed up CPU"], correctIndex: 2, difficulty: 'easy' },
    { id: "e2_2", text: "Which of the following is NOT a characteristic of a deadlock?", options: ["Mutual exclusion", "Hold and wait", "Preemption", "Circular wait"], correctIndex: 2, difficulty: 'easy' },
    { id: "e2_3", text: "Which of the following operations has the highest priority in most programming languages?", options: ["Addition (+)", "Multiplication (*)", "Division (/)", "Parentheses ()"], correctIndex: 3, difficulty: 'easy' },
    // Cycle 3
    { id: "e3_1", text: "Which normal form eliminates transitive dependency?", options: ["1NF", "2NF", "3NF", "4NF"], correctIndex: 2, difficulty: 'easy' },
    { id: "e3_2", text: "Which of the following best describes polymorphism in OOP?", options: ["Using multiple variables", "Same function behaving differently", "Hiding data", "Inheriting properties"], correctIndex: 1, difficulty: 'easy' },
    { id: "e3_3", text: "What happens if you pop from an empty stack?", options: ["Returns 0", "Returns null", "Stack overflow", "Stack underflow"], correctIndex: 3, difficulty: 'easy' },
    // Cycle 4
    { id: "e4_1", text: "Which of the following sorting algorithms has the best average-case time complexity?", options: ["Bubble Sort", "Selection Sort", "Merge Sort", "Insertion Sort"], correctIndex: 2, difficulty: 'easy' },
    { id: "e4_2", text: "What does the “git pull” command do?", options: ["Uploads code to repository", "Deletes repository", "Fetches and merges changes", "Creates a new branch"], correctIndex: 2, difficulty: 'easy' },
    { id: "e4_3", text: "In healthcare IoT, patient data is sent to doctors remotely. What is this called?", options: ["Telemedicine", "Automation", "Networking", "Programming"], correctIndex: 0, difficulty: 'easy' },
    // Cycle 5
    { id: "e5_1", text: "What is the space complexity of Merge Sort?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], correctIndex: 2, difficulty: 'easy' },
    { id: "e5_2", text: "Which of the following is NOT a relational database?", options: ["MySQL", "PostgreSQL", "MongoDB", "Oracle"], correctIndex: 2, difficulty: 'easy' },
    { id: "e5_3", text: "Which of the following is a compiled programming language?", options: ["Python", "JavaScript", "C++", "PHP"], correctIndex: 2, difficulty: 'easy' },
    // Cycle 6
    { id: "e6_1", text: "Which of the following expressions is always TRUE?", options: ["(x > y) && (y > x)", "(x == y) || (x != y)", "(x < y) && (x > y)", "(x != x)"], correctIndex: 1, difficulty: 'easy' },
    { id: "e6_2", text: "In Python, which of the following is an immutable data type?", options: ["List", "Dictionary", "Tuple", "Set"], correctIndex: 2, difficulty: 'easy' },
    { id: "e6_3", text: "Which of the following operations is fastest in a hash table (average case)?", options: ["Searching", "Sorting", "Traversal", "Merging"], correctIndex: 0, difficulty: 'easy' },
    // Cycle 7
    { id: "e7_1", text: "Which of the following best describes encapsulation in OOP?", options: ["Wrapping data and methods together", "Inheriting properties", "Changing function behavior", "Hiding only data"], correctIndex: 0, difficulty: 'easy' },
    { id: "e7_2", text: "Which of the following is NOT an example of an operating system?", options: ["Linux", "Windows", "Oracle", "macOS"], correctIndex: 2, difficulty: 'easy' },
    { id: "e7_3", text: "Which SQL clause is used to filter groups after aggregation?", options: ["WHERE", "GROUP BY", "HAVING", "ORDER BY"], correctIndex: 2, difficulty: 'easy' },
    // Cycle 8
    { id: "e8_1", text: "Which of the following statements about pointers is TRUE (in C)?", options: ["Pointer stores value directly", "Pointer stores memory address", "Pointer cannot be null", "Pointer stores only integers"], correctIndex: 1, difficulty: 'easy' },
    { id: "e8_2", text: "What will be the output of the following in C-like languages? printf(\"%d\", 5/2);", options: ["2.5", "3", "2", "Error"], correctIndex: 2, difficulty: 'easy' },
    { id: "e8_3", text: "Which of the following is NOT a feature of object-oriented programming?", options: ["Encapsulation", "Inheritance", "Compilation", "Polymorphism"], correctIndex: 2, difficulty: 'easy' },
    // Cycle 9
    { id: "e9_1", text: "Which of the following has the highest time complexity in worst case?", options: ["Binary Search", "Linear Search", "Jump Search", "Interpolation Search"], correctIndex: 1, difficulty: 'easy' },
    { id: "e9_2", text: "In databases, what does “primary key” ensure?", options: ["Faster queries", "Unique identification of records", "Data encryption", "Backup storage"], correctIndex: 1, difficulty: 'easy' },
    { id: "e9_3", text: "In C, what does the “static” keyword do for a local variable?", options: ["Makes it global", "Preserves value between function calls", "Deletes variable after function ends", "Makes it constant"], correctIndex: 1, difficulty: 'easy' },
    // Cycle 10
    { id: "e10_1", text: "Which of the following is used to uniquely identify a process in an operating system?", options: ["Process ID", "Thread ID", "Memory Address", "Program Counter"], correctIndex: 0, difficulty: 'easy' },
    { id: "e10_2", text: "Which communication protocol is commonly used in IoT devices?", options: ["HTTP only", "FTP", "MQTT", "SMTP"], correctIndex: 2, difficulty: 'easy' },
    { id: "e10_3", text: "Which of the following data structures is best for implementing recursion?", options: ["Queue", "Stack", "Linked List", "Tree"], correctIndex: 1, difficulty: 'easy' }
  ],
  medium: [
    // Cycle 1
    { id: "m1_1", text: "What is the result of:\nint x = 0;\nprintf(\"%d\", x++ + ++x);", options: ["1", "2", "4", "3"], correctIndex: 1, difficulty: 'medium' },
    { id: "m1_2", text: "Which of the following is NOT possible in a single-threaded program?", options: ["Deadlock", "Starvation", "Race condition", "Infinite loop"], correctIndex: 2, difficulty: 'medium' },
    { id: "m1_3", text: "Which of the following is NOT a valid IP address format?", options: ["192.168.1.1", "256.100.50.0", "10.0.0.1", "172.16.0.5"], correctIndex: 1, difficulty: 'medium' },
    // Cycle 2
    { id: "m2_1", text: "Which of the following sorting algorithms is not stable by default?", options: ["Merge Sort", "Bubble Sort", "Quick Sort", "Insertion Sort"], correctIndex: 2, difficulty: 'medium' },
    { id: "m2_2", text: "How many subsets does a set with 3 elements have?", options: ["3", "6", "7", "8"], correctIndex: 3, difficulty: 'medium' },
    { id: "m2_3", text: "Which of the following statements about RAM is TRUE?", options: ["It is non-volatile", "It stores data permanently", "It loses data when power is off", "It is slower than hard disk"], correctIndex: 2, difficulty: 'medium' },
    // Cycle 3
    { id: "m3_1", text: "In operating systems, what is “thrashing”?", options: ["CPU overheating", "Excessive context switching", "High paging activity", "Deadlock situation"], correctIndex: 2, difficulty: 'medium' },
    { id: "m3_2", text: "Which of the following is NOT true about threads?", options: ["Threads share memory", "Threads are lightweight", "Threads have separate address space", "Threads improve performance"], correctIndex: 2, difficulty: 'medium' },
    { id: "m3_3", text: "What is the output of: printf(\"%d\", sizeof('A'));", options: ["1", "2", "4", "Depends on compiler"], correctIndex: 2, difficulty: 'medium' },
    // Cycle 4
    { id: "m4_1", text: "Which of the following is NOT possible in a single-threaded program?", options: ["Deadlock", "Starvation", "Race condition", "Infinite loop"], correctIndex: 2, difficulty: 'medium' },
    { id: "m4_2", text: "Which of the following best describes a race condition fix?", options: ["Increase CPU speed", "Use synchronization mechanisms", "Add more threads", "Use recursion"], correctIndex: 1, difficulty: 'medium' },
    { id: "m4_3", text: "Which of the following scheduling algorithms gives minimum average waiting time?", options: ["FCFS", "Round Robin", "Shortest Job First", "Priority Scheduling"], correctIndex: 2, difficulty: 'medium' },
    // Cycle 5
    { id: "m5_1", text: "Which of the following is true about mutex?", options: ["Allows multiple processes simultaneously", "Prevents race conditions", "Used only in networking", "Increases deadlocks"], correctIndex: 1, difficulty: 'medium' },
    { id: "m5_2", text: "What is the worst-case time complexity of Quick Sort?", options: ["O(n log n)", "O(log n)", "O(n²)", "O(n)"], correctIndex: 2, difficulty: 'medium' },
    { id: "m5_3", text: "Which data structure is used to implement recursion internally?", options: ["Queue", "Stack", "Heap", "Graph"], correctIndex: 1, difficulty: 'medium' },
    // Cycle 6
    { id: "m6_1", text: "Which is correct?", options: ["Empty set = {0}", "Empty set ⊂ {0}", "Empty set ∈ {0}", "Empty set = ∅ = {∅}"], correctIndex: 1, difficulty: 'medium' },
    { id: "m6_2", text: "What is the space complexity of Merge Sort?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], correctIndex: 2, difficulty: 'medium' },
    { id: "m6_3", text: "Which of the following is TRUE about normalization in databases?", options: ["It increases redundancy", "It removes anomalies", "It slows down queries always", "It duplicates data"], correctIndex: 1, difficulty: 'medium' },
    // Cycle 7
    { id: "m7_1", text: "Which data structure is used for implementing graphs?", options: ["Array only", "Linked List only", "Adjacency List / Matrix", "Stack"], correctIndex: 2, difficulty: 'medium' },
    { id: "m7_2", text: "Which normal form removes partial dependency?", options: ["1NF", "2NF", "3NF", "BCNF"], correctIndex: 1, difficulty: 'medium' },
    { id: "m7_3", text: "Which of the following operations is NOT allowed on a stack?", options: ["Push", "Pop", "Peek", "Insert at middle"], correctIndex: 3, difficulty: 'medium' },
    // Cycle 8
    { id: "m8_1", text: "Which of the following problems can be solved using Dynamic Programming?", options: ["Binary Search", "Fibonacci Sequence", "Linear Search", "Depth First Search"], correctIndex: 1, difficulty: 'medium' },
    { id: "m8_2", text: "Which traversal gives sorted output in a Binary Search Tree (BST)?", options: ["Preorder", "Postorder", "Inorder", "Level order"], correctIndex: 2, difficulty: 'medium' },
    { id: "m8_3", text: "Which data structure is used in Breadth-First Search (BFS)?", options: ["Stack", "Queue", "Heap", "Tree"], correctIndex: 1, difficulty: 'medium' },
    // Cycle 9
    { id: "m9_1", text: "What is Docker used for?", options: ["Gaming", "Virtualization & containers", "Web design", "Database storage"], correctIndex: 1, difficulty: 'medium' },
    { id: "m9_2", text: "What is blockchain primarily used for?", options: ["Image processing", "Secure digital transactions", "Operating systems", "Game development"], correctIndex: 1, difficulty: 'medium' },
    { id: "m9_3", text: "Which of the following is NOT a type of network topology?", options: ["Star", "Ring", "Bus", "Binary"], correctIndex: 3, difficulty: 'medium' },
    // Cycle 10
    { id: "m10_1", text: "Which traversal will you use to delete a tree?", options: ["Inorder", "Preorder", "Postorder", "Level order"], correctIndex: 2, difficulty: 'medium' },
    { id: "m10_2", text: "Who invented the World Wide Web?", options: ["Charles Babbage", "Tim Berners-Lee", "Alan Turing", "Dennis Ritchie"], correctIndex: 1, difficulty: 'medium' },
    { id: "m10_3", text: "Which join returns only matching records?", options: ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL JOIN"], correctIndex: 2, difficulty: 'medium' }
  ],
  hard: [
    // Cycle 1
    { id: "h1_1", text: "Which of the following is TRUE about virtual functions in C++?", options: ["Resolved at compile time", "Enable runtime polymorphism", "Cannot be overridden", "Used only in templates"], correctIndex: 1, difficulty: 'hard' },
    { id: "h1_2", text: "Fine-tuning:", options: ["Train from scratch", "Adjust pre-trained model", "Change hardware", "Change architecture only"], correctIndex: 1, difficulty: 'hard' },
    { id: "h1_3", text: "Which of the following is NOT a valid IP address format?", options: ["192.168.1.1", "256.100.50.0", "10.0.0.1", "172.16.0.5"], correctIndex: 1, difficulty: 'hard' },
    // Cycle 2
    { id: "h2_1", text: "What happens when you run git reset --hard HEAD~1?", options: ["Deletes repo", "Removes last commit & discards changes", "Keeps changes staged", "Nothing happens"], correctIndex: 1, difficulty: 'hard' },
    { id: "h2_2", text: "What is the main difference between git merge and git rebase?", options: ["No difference", "Merge rewrites history, rebase doesn’t", "Rebase rewrites history, merge doesn’t", "Both delete commits"], correctIndex: 2, difficulty: 'hard' },
    { id: "h2_3", text: "Which of the following problems is NP-Hard but not necessarily NP-Complete?", options: ["Travelling Salesman (optimization version)", "Travelling Salesman (decision version)", "Sorting", "Binary Search"], correctIndex: 0, difficulty: 'hard' },
    // Cycle 3
    { id: "h3_1", text: "Which of the following best describes lazy loading?", options: ["Loading all data at once", "Loading data only when required", "Loading Incomplete Data", "Loading Data Very Slowly"], correctIndex: 1, difficulty: 'hard' },
    { id: "h3_2", text: "What does git stash do?", options: ["Deletes changes", "Saves changes temporarily without committing", "Uploads changes", "Merges branches"], correctIndex: 1, difficulty: 'hard' },
    { id: "h3_3", text: "Which of the following will cause deadlock?", options: ["Circular wait + mutual exclusion", "Mutual exclusion + no preemption + hold and wait + circular wait", "Only hold and wait", "Only circular wait"], correctIndex: 1, difficulty: 'hard' },
    // Cycle 4
    { id: "h4_1", text: "What is the output of:\nprintf(\"%d\", (10 > 5) ? (2 > 3 ? 1 : 2) : 3);", options: ["1", "2", "3", "Error"], correctIndex: 1, difficulty: 'hard' },
    { id: "h4_2", text: "What does J2EE stand for?", options: ["Java 2 Enterprise Edition", "Java 2 Entertainment Edition", "Java 2 Eight Edition", "Java 2 Eclispse Edition"], correctIndex: 0, difficulty: 'hard' },
    { id: "h4_3", text: "Which data structure is used to implement recursion internally?", options: ["Queue", "Stack", "Heap", "Graph"], correctIndex: 1, difficulty: 'hard' },
    // Cycle 5
    { id: "h5_1", text: "Which of the following problems cannot be solved in polynomial time (assuming P ≠ NP)?", options: ["Sorting", "Searching", "Travelling Salesman Problem", "Binary Search"], correctIndex: 2, difficulty: 'hard' },
    { id: "h5_2", text: "Which of the following is NOT possible in a single-threaded program?", options: ["Deadlock", "Starvation", "Race condition", "Infinite loop"], correctIndex: 2, difficulty: 'hard' },
    { id: "h5_3", text: "Which of the following is TRUE about virtual memory?", options: ["It increases RAM size physically", "It uses disk to extend memory", "It removes need of RAM", "It makes programs faster always"], correctIndex: 1, difficulty: 'hard' },
    // Cycle 6
    { id: "h6_1", text: "Which of the following is TRUE regarding memory allocation in C?", options: ["malloc() initializes memory to zero", "calloc() allocates contiguous memory and initializes to zero", "realloc() always creates a new memory block", "free() deletes pointer variable"], correctIndex: 1, difficulty: 'hard' },
    { id: "h6_2", text: "Which of the following is NOT true about threads?", options: ["Threads share memory", "Threads are lightweight", "Threads have separate address space", "Threads improve performance"], correctIndex: 2, difficulty: 'hard' },
    { id: "h6_3", text: "Which of the following guarantees no starvation?", options: ["Priority Scheduling", "FCFS", "Round Robin", "Shortest Job First"], correctIndex: 2, difficulty: 'hard' },
    // Cycle 7
    { id: "h7_1", text: "Which technique prevents overfitting by adding a penalty to large weights?", options: ["Dimensionality reduction", "Regularization", "Gradient descent", "Stability Prevention"], correctIndex: 1, difficulty: 'hard' },
    { id: "h7_2", text: "What is the worst-case time complexity of Quick Sort?", options: ["O(n log n)", "O(log n)", "O(n²)", "O(n)"], correctIndex: 2, difficulty: 'hard' },
    { id: "h7_3", text: "Which of the following is NOT possible in hashing?", options: ["Collision", "Perfect hashing", "One-to-many mapping", "Many-to-one mapping"], correctIndex: 2, difficulty: 'hard' },
    // Cycle 8
    { id: "h8_1", text: "Which of the following scheduling algorithms may cause starvation?", options: ["First Come First Serve", "Round Robin", "Priority Scheduling", "Shortest Job First"], correctIndex: 2, difficulty: 'hard' },
    { id: "h8_2", text: "Which of the following best describes a race condition fix?", options: ["Increase CPU speed", "Use synchronization mechanisms", "Add more threads", "Use recursion"], correctIndex: 1, difficulty: 'hard' },
    { id: "h8_3", text: "Which of the following statements about pointers is FALSE?", options: ["Pointer can point to NULL", "Pointer arithmetic is allowed", "Pointer stores memory address", "Pointer stores actual value"], correctIndex: 3, difficulty: 'hard' },
    // Cycle 9
    { id: "h9_1", text: "Which of the following is TRUE about hashing?", options: ["It always avoids collisions", "It provides O(n) access time", "It maps data to fixed-size values", "It sorts data automatically"], correctIndex: 2, difficulty: 'hard' },
    { id: "h9_2", text: "Which normal form removes partial dependency?", options: ["1NF", "2NF", "3NF", "BCNF"], correctIndex: 1, difficulty: 'hard' },
    { id: "h9_3", text: "Which of the following is TRUE about ACID properties?", options: ["Atomicity allows partial transactions", "Consistency ensures valid state", "Isolation allows interference", "Durability is temporary"], correctIndex: 1, difficulty: 'hard' },
    // Cycle 10
    { id: "h10_1", text: "Which of the following is used to avoid deadlock in operating systems?", options: ["Banker's Algorithm", "Round Robin", "FCFS Scheduling", "Paging"], correctIndex: 0, difficulty: 'hard' },
    { id: "h10_2", text: "Which traversal gives sorted output in a Binary Search Tree (BST)?", options: ["Preorder", "Postorder", "Inorder", "Level order"], correctIndex: 2, difficulty: 'hard' },
    { id: "h10_3", text: "Which of the following is the tightest upper bound of Merge Sort?", options: ["O(n²)", "O(n log n)", "O(log n)", "O(n)"], correctIndex: 1, difficulty: 'hard' }
  ]
};

