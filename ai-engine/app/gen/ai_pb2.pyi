from google.protobuf.internal import containers as _containers
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Iterable as _Iterable, Mapping as _Mapping
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class ContractType(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    CONTRACT_TYPE_UNSPECIFIED: _ClassVar[ContractType]
    PENGADAAN: _ClassVar[ContractType]
    HIBAH: _ClassVar[ContractType]
    KERJA_SAMA_BUMDES: _ClassVar[ContractType]
    SEWA_ASET: _ClassVar[ContractType]
    UMKM: _ClassVar[ContractType]

class Severity(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    SEVERITY_UNSPECIFIED: _ClassVar[Severity]
    KRITIS: _ClassVar[Severity]
    SARAN: _ClassVar[Severity]
CONTRACT_TYPE_UNSPECIFIED: ContractType
PENGADAAN: ContractType
HIBAH: ContractType
KERJA_SAMA_BUMDES: ContractType
SEWA_ASET: ContractType
UMKM: ContractType
SEVERITY_UNSPECIFIED: Severity
KRITIS: Severity
SARAN: Severity

class LegalReference(_message.Message):
    __slots__ = ("id", "peraturan", "nomor_pasal", "isi")
    ID_FIELD_NUMBER: _ClassVar[int]
    PERATURAN_FIELD_NUMBER: _ClassVar[int]
    NOMOR_PASAL_FIELD_NUMBER: _ClassVar[int]
    ISI_FIELD_NUMBER: _ClassVar[int]
    id: int
    peraturan: str
    nomor_pasal: str
    isi: str
    def __init__(self, id: _Optional[int] = ..., peraturan: _Optional[str] = ..., nomor_pasal: _Optional[str] = ..., isi: _Optional[str] = ...) -> None: ...

class Clause(_message.Message):
    __slots__ = ("kode_pasal", "judul", "isi", "urutan", "legal_reference_id")
    KODE_PASAL_FIELD_NUMBER: _ClassVar[int]
    JUDUL_FIELD_NUMBER: _ClassVar[int]
    ISI_FIELD_NUMBER: _ClassVar[int]
    URUTAN_FIELD_NUMBER: _ClassVar[int]
    LEGAL_REFERENCE_ID_FIELD_NUMBER: _ClassVar[int]
    kode_pasal: str
    judul: str
    isi: str
    urutan: int
    legal_reference_id: int
    def __init__(self, kode_pasal: _Optional[str] = ..., judul: _Optional[str] = ..., isi: _Optional[str] = ..., urutan: _Optional[int] = ..., legal_reference_id: _Optional[int] = ...) -> None: ...

class DraftContractRequest(_message.Message):
    __slots__ = ("jenis", "jawaban", "clause_library", "legal_references")
    class JawabanEntry(_message.Message):
        __slots__ = ("key", "value")
        KEY_FIELD_NUMBER: _ClassVar[int]
        VALUE_FIELD_NUMBER: _ClassVar[int]
        key: str
        value: str
        def __init__(self, key: _Optional[str] = ..., value: _Optional[str] = ...) -> None: ...
    JENIS_FIELD_NUMBER: _ClassVar[int]
    JAWABAN_FIELD_NUMBER: _ClassVar[int]
    CLAUSE_LIBRARY_FIELD_NUMBER: _ClassVar[int]
    LEGAL_REFERENCES_FIELD_NUMBER: _ClassVar[int]
    jenis: ContractType
    jawaban: _containers.ScalarMap[str, str]
    clause_library: _containers.RepeatedCompositeFieldContainer[Clause]
    legal_references: _containers.RepeatedCompositeFieldContainer[LegalReference]
    def __init__(self, jenis: _Optional[_Union[ContractType, str]] = ..., jawaban: _Optional[_Mapping[str, str]] = ..., clause_library: _Optional[_Iterable[_Union[Clause, _Mapping]]] = ..., legal_references: _Optional[_Iterable[_Union[LegalReference, _Mapping]]] = ...) -> None: ...

class DraftContractResponse(_message.Message):
    __slots__ = ("clauses", "model")
    CLAUSES_FIELD_NUMBER: _ClassVar[int]
    MODEL_FIELD_NUMBER: _ClassVar[int]
    clauses: _containers.RepeatedCompositeFieldContainer[Clause]
    model: str
    def __init__(self, clauses: _Optional[_Iterable[_Union[Clause, _Mapping]]] = ..., model: _Optional[str] = ...) -> None: ...

class AuditContractRequest(_message.Message):
    __slots__ = ("jenis", "clauses", "mandatory_kode_pasal", "legal_references")
    JENIS_FIELD_NUMBER: _ClassVar[int]
    CLAUSES_FIELD_NUMBER: _ClassVar[int]
    MANDATORY_KODE_PASAL_FIELD_NUMBER: _ClassVar[int]
    LEGAL_REFERENCES_FIELD_NUMBER: _ClassVar[int]
    jenis: ContractType
    clauses: _containers.RepeatedCompositeFieldContainer[Clause]
    mandatory_kode_pasal: _containers.RepeatedScalarFieldContainer[str]
    legal_references: _containers.RepeatedCompositeFieldContainer[LegalReference]
    def __init__(self, jenis: _Optional[_Union[ContractType, str]] = ..., clauses: _Optional[_Iterable[_Union[Clause, _Mapping]]] = ..., mandatory_kode_pasal: _Optional[_Iterable[str]] = ..., legal_references: _Optional[_Iterable[_Union[LegalReference, _Mapping]]] = ...) -> None: ...

class Finding(_message.Message):
    __slots__ = ("kode_pasal", "tingkat", "pesan")
    KODE_PASAL_FIELD_NUMBER: _ClassVar[int]
    TINGKAT_FIELD_NUMBER: _ClassVar[int]
    PESAN_FIELD_NUMBER: _ClassVar[int]
    kode_pasal: str
    tingkat: Severity
    pesan: str
    def __init__(self, kode_pasal: _Optional[str] = ..., tingkat: _Optional[_Union[Severity, str]] = ..., pesan: _Optional[str] = ...) -> None: ...

class AuditContractResponse(_message.Message):
    __slots__ = ("findings", "skor", "model")
    FINDINGS_FIELD_NUMBER: _ClassVar[int]
    SKOR_FIELD_NUMBER: _ClassVar[int]
    MODEL_FIELD_NUMBER: _ClassVar[int]
    findings: _containers.RepeatedCompositeFieldContainer[Finding]
    skor: float
    model: str
    def __init__(self, findings: _Optional[_Iterable[_Union[Finding, _Mapping]]] = ..., skor: _Optional[float] = ..., model: _Optional[str] = ...) -> None: ...

class RedactTextRequest(_message.Message):
    __slots__ = ("text",)
    TEXT_FIELD_NUMBER: _ClassVar[int]
    text: str
    def __init__(self, text: _Optional[str] = ...) -> None: ...

class RedactTextResponse(_message.Message):
    __slots__ = ("text", "redacted_kinds")
    TEXT_FIELD_NUMBER: _ClassVar[int]
    REDACTED_KINDS_FIELD_NUMBER: _ClassVar[int]
    text: str
    redacted_kinds: _containers.RepeatedScalarFieldContainer[str]
    def __init__(self, text: _Optional[str] = ..., redacted_kinds: _Optional[_Iterable[str]] = ...) -> None: ...
