// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EvidenceRegistry
 * @notice Production-grade tamper-proof evidence integrity system
 * @dev Complete implementation with attestation support
 */
contract EvidenceRegistry {
    
    enum EvidenceStatus {
        NONE,
        REGISTERED,
        FLAGGED,
        VERIFIED
    }
    
    bytes32 public constant ACTION_COLLECTED = keccak256("COLLECTED");
    bytes32 public constant ACTION_ACCESSED = keccak256("ACCESSED");
    bytes32 public constant ACTION_TRANSFERRED = keccak256("TRANSFERRED");
    bytes32 public constant ACTION_VERIFIED = keccak256("VERIFIED");
    bytes32 public constant ACTION_ANALYZED = keccak256("ANALYZED");
    bytes32 public constant ACTION_VIOLATION = keccak256("VIOLATION");
    
    struct Evidence {
        bytes32 evidenceHash;
        string caseId;
        address collector;
        uint256 timestamp;
        EvidenceStatus status;
        uint256 custodyEventCount;
    }
    
    struct CustodyEvent {
        address handler;
        bytes32 action;
        uint256 timestamp;
        bytes32 metadataHash;
    }
    
    struct Attestation {
        address verifier;
        bool verified;
        uint256 timestamp;
    }
    
    uint256 private _evidenceCounter;
    mapping(uint256 => Evidence) private _evidence;
    mapping(uint256 => mapping(uint256 => CustodyEvent)) private _custodyLog;
    mapping(bytes32 => bool) private _hashRegistered;
    
    // ITEM #5: Attestation support
    mapping(uint256 => Attestation[]) private _attestations;
    mapping(address => bool) public isRegisteredVerifier;
    
    event EvidenceRegistered(
        uint256 indexed evidenceId,
        bytes32 indexed evidenceHash,
        string caseId,
        address indexed collector,
        uint256 timestamp
    );
    
    event CustodyEventLogged(
        uint256 indexed evidenceId,
        address indexed handler,
        bytes32 action,
        uint256 eventIndex,
        uint256 timestamp
    );
    
    event VerificationPassed(
        uint256 indexed evidenceId,
        address indexed verifier,
        uint256 timestamp
    );
    
    event TamperDetected(
        uint256 indexed evidenceId,
        address indexed verifier,
        bytes32 expectedHash,
        bytes32 submittedHash,
        uint256 timestamp
    );
    
    event VerificationAttested(
        uint256 indexed evidenceId,
        address indexed verifier,
        bool verified,
        uint256 timestamp
    );
    
    event PolicyViolation(
        uint256 indexed evidenceId,
        address indexed violator,
        bytes32 violationType,
        string details,
        uint256 timestamp
    );
    
    modifier evidenceExists(uint256 evidenceId) {
        require(
            evidenceId > 0 && evidenceId <= _evidenceCounter,
            "Evidence does not exist"
        );
        require(
            _evidence[evidenceId].status != EvidenceStatus.NONE,
            "Evidence not registered"
        );
        _;
    }
    
    function registerEvidence(
        bytes32 evidenceHash,
        string calldata caseId
    ) external returns (uint256 evidenceId) {
        require(evidenceHash != bytes32(0), "Invalid evidence hash");
        require(bytes(caseId).length > 0, "Case ID required");
        require(!_hashRegistered[evidenceHash], "Evidence hash already registered");
        
        unchecked {
            _evidenceCounter++;
        }
        evidenceId = _evidenceCounter;
        
        _evidence[evidenceId] = Evidence({
            evidenceHash: evidenceHash,
            caseId: caseId,
            collector: msg.sender,
            timestamp: block.timestamp,
            status: EvidenceStatus.REGISTERED,
            custodyEventCount: 0
        });
        
        _hashRegistered[evidenceHash] = true;
        
        emit EvidenceRegistered(
            evidenceId,
            evidenceHash,
            caseId,
            msg.sender,
            block.timestamp
        );
        
        _logCustodyEventInternal(evidenceId, ACTION_COLLECTED, bytes32(0));
    }
    
    function logCustodyEvent(
        uint256 evidenceId,
        bytes32 action
    ) external evidenceExists(evidenceId) {
        _logCustodyEventInternal(evidenceId, action, bytes32(0));
    }
    
    function logCustodyEventWithMetadata(
        uint256 evidenceId,
        bytes32 action,
        bytes32 metadataHash
    ) external evidenceExists(evidenceId) {
        require(metadataHash != bytes32(0), "Metadata hash required");
        _logCustodyEventInternal(evidenceId, action, metadataHash);
    }
    
    function _logCustodyEventInternal(
        uint256 evidenceId,
        bytes32 action,
        bytes32 metadataHash
    ) private {
        Evidence storage evidence = _evidence[evidenceId];
        uint256 eventIndex = evidence.custodyEventCount;
        
        _custodyLog[evidenceId][eventIndex] = CustodyEvent({
            handler: msg.sender,
            action: action,
            timestamp: block.timestamp,
            metadataHash: metadataHash
        });
        
        unchecked {
            evidence.custodyEventCount++;
        }
        
        emit CustodyEventLogged(
            evidenceId,
            msg.sender,
            action,
            eventIndex,
            block.timestamp
        );
    }
    
    function verifyEvidence(
        uint256 evidenceId,
        bytes32 submittedHash
    ) external evidenceExists(evidenceId) returns (bool verified) {
        require(submittedHash != bytes32(0), "Invalid submitted hash");
        
        Evidence storage evidence = _evidence[evidenceId];
        bytes32 expectedHash = evidence.evidenceHash;
        
        verified = (expectedHash == submittedHash);
        
        if (verified) {
            evidence.status = EvidenceStatus.VERIFIED;
            _logCustodyEventInternal(evidenceId, ACTION_VERIFIED, submittedHash);
            
            emit VerificationPassed(
                evidenceId,
                msg.sender,
                block.timestamp
            );
        } else {
            evidence.status = EvidenceStatus.FLAGGED;
            
            emit TamperDetected(
                evidenceId,
                msg.sender,
                expectedHash,
                submittedHash,
                block.timestamp
            );
        }
    }
    
    // ITEM #5: Multi-node attestation
    function registerAsVerifier() external {
        isRegisteredVerifier[msg.sender] = true;
    }
    
    function attestVerification(
        uint256 evidenceId,
        bool verified
    ) external evidenceExists(evidenceId) {
        require(isRegisteredVerifier[msg.sender], "Not registered verifier");
        
        Attestation[] storage attestations = _attestations[evidenceId];
        for (uint i = 0; i < attestations.length; i++) {
            require(attestations[i].verifier != msg.sender, "Already attested");
        }
        
        attestations.push(Attestation({
            verifier: msg.sender,
            verified: verified,
            timestamp: block.timestamp
        }));
        
        emit VerificationAttested(
            evidenceId,
            msg.sender,
            verified,
            block.timestamp
        );
    }
    
    function getAttestationCount(uint256 evidenceId)
        external
        view
        evidenceExists(evidenceId)
        returns (uint256)
    {
        return _attestations[evidenceId].length;
    }
    
    function getAttestation(uint256 evidenceId, uint256 index)
        external
        view
        evidenceExists(evidenceId)
        returns (Attestation memory)
    {
        require(index < _attestations[evidenceId].length, "Index out of bounds");
        return _attestations[evidenceId][index];
    }
    
    function getEvidence(uint256 evidenceId) 
        external 
        view 
        evidenceExists(evidenceId) 
        returns (Evidence memory) 
    {
        return _evidence[evidenceId];
    }
    
    function getCustodyEvent(uint256 evidenceId, uint256 eventIndex)
        external
        view
        evidenceExists(evidenceId)
        returns (CustodyEvent memory)
    {
        require(
            eventIndex < _evidence[evidenceId].custodyEventCount,
            "Event index out of bounds"
        );
        return _custodyLog[evidenceId][eventIndex];
    }
    
    function getCustodyEventCount(uint256 evidenceId)
        external
        view
        evidenceExists(evidenceId)
        returns (uint256 count)
    {
        return _evidence[evidenceId].custodyEventCount;
    }
    
    function isHashRegistered(bytes32 evidenceHash) 
        external 
        view 
        returns (bool) 
    {
        return _hashRegistered[evidenceHash];
    }
    
    function getEvidenceCount() external view returns (uint256) {
        return _evidenceCounter;
    }
    
    function getActionHash(string memory actionName) 
        external 
        pure 
        returns (bytes32) 
    {
        return keccak256(bytes(actionName));
    }
}
